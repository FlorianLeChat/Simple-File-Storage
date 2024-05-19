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
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { readdir } from "fs/promises";
import Credentials from "next-auth/providers/credentials";
import { existsSync } from "fs";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "./prisma";
import { logger } from "./pino";
import sendVerificationRequest from "./node-mailer";

export const { handlers, auth, signIn, signOut } = NextAuth( () => ( {
	jwt: {
		encode: async ( params ) => cookies().get( "authjs.session-token" )?.value ?? encode( params )
	},
	pages: {
		error: "/",
		signIn: "/authentication",
		signOut: "/",
		verifyRequest: "/authentication?error=ValidationRequired"
	},
	adapter: PrismaAdapter( prisma ) as Adapter, // https://github.com/nextauthjs/next-auth/issues/9493#issuecomment-1871601543
	basePath: `${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/auth`,
	trustHost: true,
	callbacks: {
		// Modification du comportement du mécanisme d'authentification
		//  afin de supporter la persistance de la session utilisateur
		//  dans la base de données au lieu des JWT.
		//  Source : https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-7807750
		async signIn( { user, credentials } )
		{
			// On vérifie d'abord si un utilisateur a été fourni
			//  et si la requête d'authentification est basée sur
			//  des informations d'identification.
			if ( user.id && credentials )
			{
				// Si c'est le cas, on tente de générer un jeton
				//  d'authentification de session pour l'utilisateur.
				//  Source : https://github.com/nextauthjs/next-auth/discussions/3794
				const time = 24 * 60 * 60 * ( credentials.remembered ? 30 : 1 );
				const adapter = PrismaAdapter( prisma ) as Adapter;
				const sessionToken = crypto.randomUUID();
				const createdSession = adapter?.createSession
					? await adapter?.createSession( {
						userId: user.id,
						expires: new Date( Date.now() + time * 1000 ),
						sessionToken
					} )
					: false;

				if ( !createdSession )
				{
					// Si la session n'a pas pu être créée, on casse
					//  le processus d'authentification.
					logger.error(
						{ source: __filename, user, credentials },
						"Session creation failed"
					);

					return false;
				}

				// Dans le cas contraire, on définit le jeton d'authentification
				//  de session dans les cookies du navigateur.
				logger.debug(
					{ source: __filename, user, credentials },
					"Session created"
				);

				cookies().set( {
					name: "authjs.session-token",
					value: sessionToken,
					maxAge: time * 1000,
					httpOnly: true,
					sameSite: "lax"
				} );
			}

			// Dans tous les cas, on continue le processus d'authentification.
			return true;
		},
		// Gestion données de session en base de données.
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-database
		async session( { session, user } )
		{
			if ( session )
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

				session.user.id = user.id;
				session.user.otp = otp?.secret;
				session.user.role = user.role;
				session.user.oauth = !user.password && !user.emailVerified;
				session.user.preferences = preferences ?? {
					font: "inter",
					theme: "light",
					color: "blue",
					public: false,
					extension: false,
					versions: true,
					default: true // Utilisation des préférences par défaut.
				};
				session.user.notification = user.notification;

				// Vérification de l'existence du dossier d'enregistrement
				//  des avatars utilisateurs.
				const directory = join( process.cwd(), "public/avatars" );

				if ( existsSync( directory ) )
				{
					// Vérification de l'existence d'un avatar personnalisé.
					const avatars = await readdir( directory );
					const avatar = avatars.find( ( file ) => file.includes( user.id ) );

					if ( avatar )
					{
						// Définition de l'avatar personnalisé de l'utilisateur.
						session.user.image = `${ process.env.__NEXT_ROUTER_BASEPATH }/avatars/${ avatar }?version=${ Date.now() }`;
					}
				}

				logger.debug(
					{ source: __filename, user: session.user },
					"Session updated"
				);
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