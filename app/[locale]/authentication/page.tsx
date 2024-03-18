//
// Route vers la page d'authentification du site.
//

// Importation des dépendances.
import Link from "next/link";
import { lazy } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "../layout";

// Importation des composants.
import { Tabs,
	TabsContent,
	TabsList,
	TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";

const OAuthForm = lazy( () => import( "./components/oauth" ) );
const SignUpForm = lazy( () => import( "./components/signup" ) );
const SignInForm = lazy( () => import( "./components/signin" ) );
const ResetPasswordModal = lazy( () => import( "./components/reset-password" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Authentification – Simple File Storage"
};

// Affichage de la page.
export default async function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Déclaration des constantes.
	const session = await auth();
	const { title } = await generateMetadata();

	// Vérification de la session utilisateur.
	if ( session )
	{
		redirect( "/dashboard" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header className="mt-auto p-4 pt-8 text-center">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold max-sm:overflow-hidden max-sm:text-ellipsis max-sm:whitespace-nowrap">
					<Link href="/">💾 {title as string}</Link>
				</h1>
			</header>

			{/* Contenu de la page */}
			<Tabs
				className="mb-4 flex w-full flex-col justify-center space-y-6 p-4 text-center sm:mx-auto sm:w-[500px]"
				defaultValue="signUp"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="signUp">Inscription</TabsTrigger>
					<TabsTrigger value="signIn">Connexion</TabsTrigger>
				</TabsList>

				{/* Formulaire d'inscription */}
				<TabsContent value="signUp" className="space-y-6">
					{/* Titre et description du formulaire */}
					<h2 className="text-xl font-semibold tracking-tight">
						Création d&lsquo;un compte
					</h2>

					<p className="text-sm text-muted-foreground">
						Saisissez votre adresse électronique pour créer un
						nouveau compte utilisateur. Vous recevrez un lien
						d&lsquo;activation pour valider votre compte et saisir
						un mot de passe.
					</p>

					<SignUpForm />
				</TabsContent>

				{/* Formulaire de connexion */}
				<TabsContent value="signIn" className="space-y-6">
					{/* Titre et description du formulaire */}
					<h2 className="text-xl font-semibold tracking-tight">
						Connexion à un compte
					</h2>

					<p className="text-sm text-muted-foreground">
						Saisissez votre adresse électronique pour vous connecter
						à l&lsquo;aide d&lsquo;un lien d&lsquo;authentification.
						Si vous avez associé un mot de passe à votre compte,
						vous pouvez également le saisir pour vous connecter
						directement. <ResetPasswordModal />
					</p>

					<SignInForm />
				</TabsContent>

				{/* Barre verticale de séparation */}
				<div className="flex items-center space-x-2">
					<Separator className="w-auto flex-grow" />

					<p className="text-xs uppercase text-muted-foreground">
						Ou continuer avec
					</p>

					<Separator className="w-auto flex-grow" />
				</div>

				{/* Fournisseurs d'authentification externes */}
				<OAuthForm />

				{/* Conditions d'utilisation et politique de confidentialité */}
				<p className="px-8 text-center text-sm text-muted-foreground">
					En continuant, vous acceptez nos{" "}
					<Link
						href="/legal/terms"
						target="_blank"
						className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
					>
						conditions d&lsquo;utilisation
					</Link>{" "}
					et notre{" "}
					<Link
						href="/legal/privacy"
						target="_blank"
						className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
					>
						politique de confidentialité
					</Link>
					.
				</p>
			</Tabs>
		</>
	);
}