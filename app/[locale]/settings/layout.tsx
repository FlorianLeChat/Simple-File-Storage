//
// Structure HTML générale des paramètres utilisateur.
//

// Importation des dépendances.
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { fetchMetadata } from "@/utilities/metadata";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Routes = lazy( () => import( "./components/routes" ) );
const FadeText = lazy( () => import( "../components/ui/thirdparty/fade-text" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "../components/navigation" ) );
const Notification = lazy( () => import( "../components/notification" ) );

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<Metadata>
{
	const metadata = await fetchMetadata();
	const messages = await getTranslations();

	return {
		title: `${ messages( "header.settings" ) } – ${ metadata.title }`
	};
}

export default async function Layout( {
	children,
	params
}: Readonly<{
	children: ReactNode;
	params: Promise<{ locale: string }>;
}> )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await fetchMetadata();
	const session = await auth();
	const messages = await getTranslations();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="container mx-auto flex min-h-16 flex-wrap items-center justify-center gap-y-4 px-4 py-8 md:gap-x-4 md:py-4">
				{/* Titre du site */}
				<h1 className="text-center text-2xl font-semibold max-md:w-full max-md:truncate md:max-w-fit md:text-xl">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

				{/* Navigation du site */}
				<Navigation
					theme={session.user.preferences.theme}
					source={meta.source}
				/>

				{/* Éléments latéraux */}
				<aside className="flex items-center justify-center space-x-4 md:ml-auto">
					{/* Notifications */}
					<Notification />

					{/* Menu utilisateur */}
					<UserMenu session={session} />
				</aside>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			<main className="container mx-auto max-w-[1440px] p-8 max-md:p-4 max-md:pb-8">
				{/* En-tête de la page */}
				<header>
					<FadeText
						as="h2"
						className="text-2xl font-bold tracking-tight"
						direction="left"
					>
						{messages( "settings.header" )}
					</FadeText>

					<FadeText
						as="p"
						delay={0.2}
						className="text-muted-foreground"
						direction="left"
					>
						{messages( "settings.description" )}
					</FadeText>
				</header>

				{/* Barre verticale de séparation */}
				<Separator className="mb-6 mt-4 md:mb-8 md:mt-6" />

				<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					{/* Routes de navigation */}
					<Routes />

					{/* Contenu principal */}
					<section className="flex-1 space-y-6">{children}</section>
				</div>
			</main>
		</>
	);
}