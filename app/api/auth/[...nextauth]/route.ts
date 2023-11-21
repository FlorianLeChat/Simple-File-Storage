//
// Route de paramétrage des mécanismes d'authentification de Next Auth.
//
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
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
				// On vérifie ensuite si l'adresse électronique existe déjà
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
		} ),

		// Authentification via adresse électronique et mot de passe.
		CredentialsProvider( {
			name: "Credentials",
			credentials: {
				// Inutile dans notre cas mais requis par TypeScript.
				email: { type: "email" },
				password: { type: "password" }
			},
			async authorize( credentials )
			{
				// On vérifie d'abord si des informations d'authentification
				//  ont été fournies.
				if ( !credentials )
				{
					return null;
				}

				// On valide ensuite les informations d'authentification avec
				//  le schéma de validation Zod créé précédemment.
				const parse = schema.safeParse( {
					email: credentials.email,
					password:
						credentials.password === ""
							? null
							: credentials.password
				} );

				if ( !parse.success )
				{
					// Si les informations d'authentification ne sont pas valides,
					//  on retourne une erreur générique.
					return null;
				}

				// On tente après de trouver un utilisateur avec l'adresse électronique
				//  fournie dans la base de données.
				const exists = await prisma.user.findUnique( {
					where: {
						email: credentials?.email
					}
				} );

				if ( exists?.password )
				{
					// Si l'utilisateur existe déjà, on compare le mot de passe
					//  fourni avec celui de la base de données avant de retourner
					//  l'utilisateur.
					const user = await bcrypt.compare(
						credentials.password,
						exists.password
					);

					if ( user )
					{
						return exists;
					}
				}
				else
				{
					// Dans le cas contraire, on crée un nouvel utilisateur
					//  avec le mot de passe fourni.
					const hashedPassword = await bcrypt.hash(
						credentials.password,
						13
					);

					return prisma.user.create( {
						data: {
							email: credentials.email,
							password: hashedPassword
						}
					} );
				}

				// On retourne enfin une erreur générique si aucune des conditions
				//  précédentes n'a été rencontrée.
				return null;
			}
		} )
	]
};

const handler = NextAuth( authOptions );

export { handler as GET, handler as POST };