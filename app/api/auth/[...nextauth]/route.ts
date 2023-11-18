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
		// https://authjs.dev/guides/basics/role-based-access-control#with-database
		session( { session, user } )
		{
			if ( session )
			{
				session.user.id = user.id;
				session.user.role = user.role;
			}

			return session;
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