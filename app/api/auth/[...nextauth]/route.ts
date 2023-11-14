//
// Route de paramétrage des mécanismes d'authentification de Next Auth.
//
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth( {
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
} );

export { handler as GET, handler as POST };