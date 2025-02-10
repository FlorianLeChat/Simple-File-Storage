//
// Route vers la page d'authentification du site.
//

// Importation des dépendances.
import Link from "next/link";
import { lazy } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { fetchMetadata } from "@/utilities/metadata";

// Importation des composants.
import { Tabs,
	TabsContent,
	TabsList,
	TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";

const BlurIn = lazy( () => import( "../components/ui/thirdparty/blur-in" ) );
const FadeText = lazy( () => import( "../components/ui/thirdparty/fade-text" ) );
const OAuthForm = lazy( () => import( "./components/oauth" ) );
const SignUpForm = lazy( () => import( "./components/signup" ) );
const SignInForm = lazy( () => import( "./components/signin" ) );
const WordPullUp = lazy(
	() => import( "../components/ui/thirdparty/word-pull-up" )
);

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<Metadata>
{
	const metadata = await fetchMetadata();
	const messages = await getTranslations();

	return {
		title: `${ messages( "header.authenticate" ) } – ${ metadata.title }`
	};
}

// Affichage de la page.
export default async function Page( {
	params
}: Readonly<{
	params: Promise<{ locale: string }>;
}> )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Déclaration des constantes.
	const session = await auth();
	const messages = await getTranslations();
	const { title } = await fetchMetadata();

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
				<h1 className="text-2xl font-semibold max-sm:truncate">
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
						{messages( "authentication.register_button" )}
					</TabsTrigger>

					<TabsTrigger value="signIn">
						{messages( "authentication.login_button" )}
					</TabsTrigger>
				</TabsList>

				{/* Formulaire d'inscription */}
				<TabsContent value="signUp" className="space-y-6">
					{/* Titre et description du formulaire */}
					<WordPullUp
						as="h2"
						words={messages( "authentication.register_title" )}
						className="text-xl font-semibold tracking-tight"
					/>

					<FadeText
						as="p"
						className="text-sm text-muted-foreground"
						direction="up"
					>
						{messages( "authentication.register_description" )}
					</FadeText>

					<SignUpForm />
				</TabsContent>

				{/* Formulaire de connexion */}
				<TabsContent value="signIn" className="space-y-6">
					{/* Titre et description du formulaire */}
					<WordPullUp
						as="h2"
						words={messages( "authentication.login_title" )}
						className="text-xl font-semibold tracking-tight"
					/>

					<FadeText
						as="p"
						className="text-sm text-muted-foreground"
						direction="up"
					>
						{messages( "authentication.login_description" )}
					</FadeText>

					<SignInForm />
				</TabsContent>

				{/* Barre verticale de séparation */}
				<div className="flex items-center space-x-2">
					<Separator className="w-auto grow" />

					<p className="text-xs uppercase text-muted-foreground">
						{messages( "authentication.continue_with" )}
					</p>

					<Separator className="w-auto grow" />
				</div>

				{/* Fournisseurs d'authentification externes */}
				<OAuthForm />

				{/* Mentions légales */}
				<BlurIn
					as="p"
					className="px-8 text-center text-sm text-muted-foreground"
				>
					{messages.rich( "authentication.accept_terms", {
						a: ( chunks ) => (
							<Link
								href="/legal"
								target="_blank"
								className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
							>
								{chunks}
							</Link>
						)
					} )}
				</BlurIn>
			</Tabs>
		</>
	);
}