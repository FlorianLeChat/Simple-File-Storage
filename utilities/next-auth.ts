//
// Options de configuration de Next Auth.
//  Source : https://authjs.dev/guides/providers/custom-provider
//
import Email from "next-auth/providers/nodemailer";
import bcrypt from "bcrypt";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type User } from "next-auth";

import prisma from "./prisma";
import { logger } from "./pino";
import { getGravatarUrl } from "./gravatar";
import sendVerificationRequest from "./node-mailer";

export const { handlers, auth, signIn, signOut } = NextAuth( () => ( {
	pages: {
		error: "/",
		signIn: "/authentication",
		signOut: "/",
		verifyRequest: "/authentication?error=ValidationRequired"
	},
	adapter: PrismaAdapter( prisma ),
	session: {
		strategy: process.env.NEXT_PUBLIC_ENV === "production" ? "database" : "jwt"
	},
	basePath: process.env.AUTH_URL ? undefined : "/api/user/auth",
	trustHost: true,
	callbacks: {
		// Gestion des données du jeton JWT (environnement de test et de développement).
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-jwt
		async jwt( { token } )
		{
			if ( token )
			{
				// Récupération des données de l'utilisateur.
				const user = await prisma.user.findUnique( {
					where: {
						email: token.email ?? ""
					},
					include: {
						preferences: true
					}
				} );

				if ( !user )
				{
					return token;
				}

				// Ajout de propriétés personnalisées à la session.
				token.id = user.id;
				token.name = user.name;
				token.role = user.role;
				token.email = user.email;
				token.image = user.image ?? ( await getGravatarUrl( user.email ) );
				token.oauth = !user.password && !user.emailVerified;
				token.preferences = user.preferences[ 0 ] ?? {
					font: "inter",
					theme: "light",
					color: "blue",
					public: false,
					extension: false,
					versions: true,
					default: true // Utilisation des préférences par défaut.
				};
				token.notification = user.notification;
			}

			return token;
		},
		// Gestion données de session en base de données (environnement de production).
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-database
		async session( { session, token, user } )
		{
			if ( session )
			{
				if ( token )
				{
					// Données de session via JWT.
					session.user.id = token.id;
					session.user.role = token.role;
					session.user.oauth = token.oauth;
					session.user.image = token.image;
					session.user.preferences = token.preferences;
					session.user.notification = token.notification;
				}
				else if ( user )
				{
					// Données de session via base de données.
					const avatar = await getGravatarUrl( user.email );
					const preferences = await prisma.preference.findUnique( {
						where: {
							userId: user.id
						}
					} );

					session.user.id = user.id;
					session.user.role = user.role;
					session.user.image = user.image ?? avatar;
					session.user.oauth = !user.password && !user.emailVerified;
					session.user.preferences = preferences ?? {
						font: "inter",
						theme: "light",
						color: "blue",
						public: false,
						extension: false,
						versions: true,
						default: true
					};
					session.user.notification = user.notification;
				}
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
			server: {},
			sendVerificationRequest
		} ),

		// Authentification via compte utilisateur.
		Credentials( {
			async authorize( credentials )
			{
				// On vérifie d'abord si le mécanisme d'authentification est
				//  utilisé en environnement de développement.
				if ( process.env.NEXT_PUBLIC_ENV === "production" )
				{
					logger.error(
						{ source: __dirname, credentials },
						"Credentials used in production environment"
					);

					return null;
				}

				// On vérifie si des informations d'authentification ont été fournies.
				if ( !credentials )
				{
					logger.error(
						{ source: __dirname },
						"Credentials not provided"
					);

					return null;
				}

				// On tente de récupérer le compte utilisateur via son adresse
				//  électronique avant de vérifier si le mot de passe fourni
				//  correspond à celui enregistré dans la base de données.
				const exists = ( await prisma.user.findUnique( {
					where: {
						email: credentials.email as string
					}
				} ) ) as User | null;

				if ( exists?.password )
				{
					// On compare ensuite le mot de passe fourni avec celui
					//  enregistré dans la base de données.
					const user = await bcrypt.compare(
						credentials.password as string,
						exists.password
					);

					logger.debug(
						{ source: __dirname, user, exists },
						"Credentials verified"
					);

					// Si les deux mots de passe correspondent, on retourne
					//  le compte utilisateur.
					return user ? exists : null;
				}

				logger.error(
					{ source: __dirname, exists },
					"Credentials not verified"
				);

				// Dans le cas contraire, on retourne enfin une valeur nulle.
				return null;
			}
		} )
	]
} ) );