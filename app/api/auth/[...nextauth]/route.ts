//
// Route de paramétrage des mécanismes d'authentification de Next Auth.
//
import prisma from "@/utilities/prisma";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import sendVerificationRequest from "@/utilities/nodemailer";
import NextAuth, { type NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
	pages: {
		error: "/",
		signIn: "/authentication",
		signOut: "/dashboard",
		newUser: "/dashboard",
		verifyRequest: "/authentication?error=ValidationRequired"
	},
	adapter: PrismaAdapter( prisma ),
	callbacks: {
		// Gestion des rôles d'utilisateurs.
		//  Source : https://authjs.dev/guides/basics/role-based-access-control#with-database
		session( { session, user } )
		{
			if ( session )
			{
				// Ajout de l'identifiant unique et du rôle
				//  de l'utilisateur à la session.
				session.user.id = user.id;
				session.user.role = user.role;
			}

			return session;
		},
		// Filtrage de l'envoi des courriels de validation.
		//  Source : https://next-auth.js.org/providers/email#sending-magic-links-to-existing-users
		async signIn( { user, email } )
		{
			// On vérifie d'abord si une adresse électronique a été fournie
			//  et si le mécanisme d'authentification demande une validation.
			if ( user.email && email?.verificationRequest )
			{
				// On vérifite ensuite si l'adresse électronique existe déjà
				//  dans la collection des utilisateurs.
				const exists = await prisma.user.findUnique( {
					where: {
						email: user.email
					}
				} );

				if ( exists )
				{
					// Si c'est le cas, on continue le processus d'authentification.
					return true;
				}

				// Dans le cas contraire, on retourne une erreur générique.
				return `${ process.env.NEXTAUTH_URL }/authentication?error=PasswordRequired`;
			}

			// Si ce n'est pas notre cas de figure, on continue enfin le processus
			//  d'authentification de l'utilisateur.
			return true;
		}
	},
	providers: [
		// Authentification via Google.
		GoogleProvider( {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
		} ),

		// Authentification via GitHub.
		GithubProvider( {
			clientId: process.env.GITHUB_CLIENT_ID ?? "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
		} ),

		// Authentification via courriel.
		EmailProvider( {
			from: process.env.SMTP_USERNAME,
			sendVerificationRequest,
			server: {
				secure: process.env.SMTP_PORT === "465",
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT,
				auth: {
					user: process.env.SMTP_USERNAME,
					pass: process.env.SMTP_PASSWORD
				},
				dkim: {
					domainName: process.env.DKIM_DOMAIN,
					privateKey: process.env.DKIM_PRIVATE_KEY,
					keySelector: process.env.DKIM_SELECTOR
				}
			}
		} )
	]
};

const handler = NextAuth( authOptions );

export { handler as GET, handler as POST };