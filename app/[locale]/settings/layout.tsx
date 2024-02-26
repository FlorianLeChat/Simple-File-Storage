//
// Structure HTML générale des paramètres utilisateur.
//

// Importation des dépendances.
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "../layout";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Routes = lazy( () => import( "./components/routes" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "../components/navigation" ) );
const Notification = lazy( () => import( "../components/notification" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Paramètres – Simple File Storage"
};

export default async function Layout( {
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await generateMetadata();
	const session = await auth();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="mx-auto flex min-h-[4rem] w-full max-w-screen-2xl flex-wrap items-center justify-center gap-y-4 px-4 py-8 md:gap-x-4 md:py-4">
				{/* Titre du site */}
				<h1 className="text-center text-2xl font-semibold max-md:w-full max-md:overflow-hidden max-md:text-ellipsis max-md:whitespace-nowrap md:max-w-fit md:text-xl">
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

			<main className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
				{/* En-tête de la page */}
				<header>
					<h2 className="text-2xl font-bold tracking-tight">
						Paramètres généraux
					</h2>

					<p className="text-muted-foreground">
						Gérer les paramètres de votre compte et du site.
					</p>
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