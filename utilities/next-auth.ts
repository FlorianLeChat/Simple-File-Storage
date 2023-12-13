//
// Options de configuration de Next Auth.
//  Source : https://authjs.dev/guides/providers/custom-provider
//
import Email from "@auth/core/providers/email";
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import sendVerificationRequest from "@/utilities/nodemailer";
import NextAuth, { type NextAuthConfig } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth( {
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

		// Authentification via adresse électronique et mot de passe.
		Credentials( {
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

					return user ? exists : null;
				}

				// Dans le cas contraire, on crée enfin un nouvel utilisateur
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
		} )
	]
} satisfies NextAuthConfig );