//
// Route vers la page d'authentification du site.
//

// Importation des dépendances.
import Link from "next/link";
import { lazy } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

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
	const t = await getTranslations();
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
					<TabsTrigger value="signUp">
						{t( "authentication.register_button" )}
					</TabsTrigger>

					<TabsTrigger value="signIn">
						{t( "authentication.login_button" )}
					</TabsTrigger>
				</TabsList>

				{/* Formulaire d'inscription */}
				<TabsContent value="signUp" className="space-y-6">
					{/* Titre et description du formulaire */}
					<h2 className="text-xl font-semibold tracking-tight">
						{t( "authentication.register_title" )}
					</h2>

					<p className="text-sm text-muted-foreground">
						{t( "authentication.register_description" )}
					</p>

					<SignUpForm />
				</TabsContent>

				{/* Formulaire de connexion */}
				<TabsContent value="signIn" className="space-y-6">
					{/* Titre et description du formulaire */}
					<h2 className="text-xl font-semibold tracking-tight">
						{t( "authentication.login_title" )}
					</h2>

					<p className="text-sm text-muted-foreground">
						{t( "authentication.login_description" )}{" "}
						<ResetPasswordModal />
					</p>

					<SignInForm />
				</TabsContent>

				{/* Barre verticale de séparation */}
				<div className="flex items-center space-x-2">
					<Separator className="w-auto flex-grow" />

					<p className="text-xs uppercase text-muted-foreground">
						{t( "authentication.continue_with" )}
					</p>

					<Separator className="w-auto flex-grow" />
				</div>

				{/* Fournisseurs d'authentification externes */}
				<OAuthForm />

				{/* Conditions d'utilisation et politique de confidentialité */}
				<p className="px-8 text-center text-sm text-muted-foreground">
					{t.rich( "authentication.accept_terms", {
						a1: ( chunks ) => (
							<Link
								href="/legal/terms"
								target="_blank"
								className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
							>
								{chunks}
							</Link>
						),
						a2: ( chunks ) => (
							<Link
								href="/legal/privacy"
								target="_blank"
								className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
							>
								{chunks}
							</Link>
						)
					} )}
				</p>
			</Tabs>
		</>
	);
}