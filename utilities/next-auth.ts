//
// Options de configuration de Next Auth.
//  Source : https://authjs.dev/guides/providers/custom-provider
//
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import EmailProvider from "@auth/core/providers/email";
import GoogleProvider from "@auth/core/providers/google";
import GithubProvider from "@auth/core/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "@auth/core/providers/credentials";
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
			from: `Simple File Storage <${ process.env.SMTP_USERNAME }>`,
			sendVerificationRequest,
			server: {
				secure: process.env.SMTP_PORT === "465",
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT
					? parseInt( process.env.SMTP_PORT, 10 )
					: 0,
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

//
// Récupère les messages d'erreurs liés à l'authentification de Next Auth.
//  Source : https://authjs.dev/guides/basics/pages#sign-in-page
//
export function getAuthErrorMessage( error: string )
{
	switch ( error )
	{
		case "OAuthSignin":
			return "Erreur lors de la connexion avec ce fournisseur d'authentification externe.";

		case "OAuthCallback" || "Callback":
			return "Erreur lors de la lecture de la réponse du fournisseur d'authentification externe.";

		case "OAuthCreateAccount" || "EmailCreateAccount":
			return "Erreur lors de la création de votre compte utilisateur dans la base de données.";

		case "OAuthAccountNotLinked":
			return "Cette adresse électronique est déjà associée à un autre compte utilisateur.";

		case "EmailSignin":
			return "Erreur lors de l'envoi du courriel de vérification à l'adresse électronique fournie.";

		case "CredentialsSignin":
			return "Erreur lors de l'authentification avec les informations de connexion fournies.";

		case "SessionRequired":
			return "Cette page nécessite une session utilisateur pour fonctionner.";

		case "ValidationRequired":
			return "Un courriel de vérification a été envoyé à l'adresse électronique fournie. Veuillez cliquer sur le lien de vérification pour continuer.";

		default:
			return undefined;
	}
}

//
// Récupère les messages d'erreurs généraux de Next Auth.
//  Source : https://authjs.dev/guides/basics/pages#error-page
//
export function getGenericErrorMessage( error: string )
{
	switch ( error )
	{
		case "Configuration":
			return "Un problème est survenu lors de la lecture de la configuration du site. Veuillez vérifier les journaux d'événements pour plus d'informations.";

		case "AccessDenied":
			return "Vous n'avez pas les autorisations nécessaires pour vous authentifier sur ce site.";

		case "Verification":
			return "Votre jeton de vérification est invalide ou a expiré. Veuillez vous reconnecter.";

		default:
			return undefined;
	}
}