//
// Options de configuration de Next Auth.
//  Source : https://authjs.dev/guides/providers/custom-provider
//
import Email from "next-auth/providers/nodemailer";
import bcrypt from "bcrypt";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { join } from "path";
import NextAuth from "next-auth";
import { readdir } from "fs/promises";
import Credentials from "next-auth/providers/credentials";
import { existsSync } from "fs";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "./prisma";
import { logger } from "./pino";
import sendVerificationRequest from "./node-mailer";

export const { handlers, auth, signIn, signOut } = NextAuth( () => ( {
	pages: {
		error: "/",
		signIn: "/authentication",
		signOut: "/",
		verifyRequest: "/authentication?error=ValidationRequired"
	},
	adapter: PrismaAdapter( prisma ) as Adapter, // https://github.com/nextauthjs/next-auth/issues/9493#issuecomment-1871601543
	session: {
		strategy: "jwt"
	},
	basePath: process.env.AUTH_URL
		? undefined
		: `${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/auth`,
	trustHost: true,
	callbacks: {
		// Gestion des données du jeton JWT.
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-jwt
		async jwt( { token, user } )
		{
			if ( token && user )
			{
				// Ajout de propriétés personnalisées à la session.
				const otp = await prisma.otp.findUnique( {
					where: {
						userId: user.id
					}
				} );

				const preferences = await prisma.preference.findUnique( {
					where: {
						userId: user.id
					}
				} );

				token.id = user.id as string;
				token.otp = otp?.secret;
				token.role = user.role;
				token.image = user.image ?? undefined;
				token.oauth = !user.password && !user.emailVerified;
				token.preferences = preferences ?? {
					font: "inter",
					theme: "light",
					color: "blue",
					public: false,
					extension: false,
					versions: true,
					default: true // Utilisation des préférences par défaut.
				};
				token.notification = user.notification;

				// Vérification de l'existence du dossier d'enregistrement
				//  des avatars utilisateurs.
				const avatars = join( process.cwd(), "public/avatars" );

				if ( existsSync( avatars ) )
				{
					// Vérification de l'existence d'un avatar personnalisé.
					const avatar = ( await readdir( avatars ) ).find( ( file ) => file.includes( token.id ) );

					if ( avatar )
					{
						// Définition de l'avatar personnalisé de l'utilisateur.
						token.image = `${ process.env.__NEXT_ROUTER_BASEPATH }/avatars/${ avatar }`;
					}
				}
			}

			return token;
		},
		// Gestion données de session en base de données.
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-database
		async session( { session, token } )
		{
			if ( session && token )
			{
				session.user.id = token.id;
				session.user.otp = token.otp;
				session.user.role = token.role;
				session.user.oauth = token.oauth;
				session.user.image = token.image;
				session.user.preferences = token.preferences;
				session.user.notification = token.notification;
			}

			return session;
		}
	},
	providers: [
		// Authentification via Google.
		Google,

		// Authentification via GitHub.
		GitHub,

		// Authentification via courriel.
		Email( {
			from: process.env.SMTP_USERNAME,
			maxAge: 1800,
			sendVerificationRequest,
			server: {
				secure: process.env.SMTP_PORT === "465",
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT ? Number( process.env.SMTP_PORT ) : 0,
				auth: {
					user: process.env.SMTP_USERNAME,
					pass: process.env.SMTP_PASSWORD
				},
				dkim: {
					domainName: process.env.DKIM_DOMAIN ?? "",
					privateKey: process.env.DKIM_PRIVATE_KEY ?? "",
					keySelector: process.env.DKIM_SELECTOR ?? ""
				}
			}
		} ),

		// Authentification via compte utilisateur.
		Credentials( {
			async authorize( credentials )
			{
				// On vérifie d'abord si des informations d'authentification
				//  ont été fournies.
				if ( !credentials )
				{
					logger.error(
						{ source: __filename },
						"Credentials not provided"
					);

					return null;
				}

				// On tente de récupérer le compte utilisateur via son adresse
				//  électronique avant de vérifier si le mot de passe fourni
				//  correspond à celui enregistré dans la base de données.
				const exists = await prisma.user.findUnique( {
					where: {
						email: credentials.email as string
					}
				} );

				if ( exists?.password )
				{
					// On compare ensuite le mot de passe fourni avec celui
					//  enregistré dans la base de données.
					const user = await bcrypt.compare(
						credentials.password as string,
						exists.password
					);

					logger.debug(
						{ source: __filename, user, exists },
						"Credentials verified"
					);

					// Si les deux mots de passe correspondent, on retourne
					//  le compte utilisateur.
					return user ? exists : null;
				}

				logger.error(
					{ source: __filename, exists },
					"Credentials not verified"
				);

				// Dans le cas contraire, on retourne enfin une valeur nulle.
				return null;
			}
		} )
	]
} ) );