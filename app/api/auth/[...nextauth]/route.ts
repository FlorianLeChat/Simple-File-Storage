//
// Route de paramétrage des mécanismes d'authentification de Next Auth.
//
import prisma from "@/utilities/prisma";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter( prisma ),
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
		} )
	]
};

const handler = NextAuth( authOptions );

export { handler as GET, handler as POST };