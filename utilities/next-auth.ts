//
// Options de configuration de Next Auth.
//  Source : https://authjs.dev/guides/providers/custom-provider
//
import Email from "@auth/core/providers/email";
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { join } from "path";
import { readdir } from "fs/promises";
import Credentials from "@auth/core/providers/credentials";
import { existsSync } from "fs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import sendVerificationRequest from "@/utilities/node-mailer";
import NextAuth, { type NextAuthConfig } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth( {
	pages: {
		error: "/",
		signIn: "/authentication",
		signOut: "/",
		verifyRequest: "/authentication?error=ValidationRequired"
	},
	adapter: PrismaAdapter( prisma ),
	callbacks: {
		// Gestion des rôles d'utilisateurs.
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-database
		async session( { session, user } )
		{
			if ( session )
			{
				// Ajout de propriétés personnalisées à la session.
				const preferences = await prisma.preference.findUnique( {
					where: {
						userId: user.id
					}
				} );

				session.user.id = user.id;
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
				const avatars = join( process.cwd(), "public/avatars" );

				if ( existsSync( avatars ) )
				{
					// Vérification de l'existence d'un avatar personnalisé.
					const avatar = ( await readdir( avatars ) ).find( ( file ) => file.includes( user.id ) );

					if ( avatar )
					{
						// Définition de l'avatar personnalisé de l'utilisateur.
						session.user.image = `${ process.env.__NEXT_ROUTER_BASEPATH }/avatars/${ avatar }`;
					}
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

					// Si les deux mots de passe correspondent, on retourne
					//  le compte utilisateur.
					return user ? exists : null;
				}

				// Dans le cas contraire, on retourne enfin une valeur nulle.
				return null;
			}
		} )
	]
} satisfies NextAuthConfig );