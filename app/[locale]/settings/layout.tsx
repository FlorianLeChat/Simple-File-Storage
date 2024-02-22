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
			<header className="flex min-h-[4rem] flex-wrap items-center justify-center gap-y-4 border-b px-4 py-8 sm:gap-x-4 sm:py-4">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold max-sm:w-full max-sm:max-w-fit max-sm:overflow-hidden max-sm:text-ellipsis max-sm:whitespace-nowrap sm:text-xl">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

				{/* Navigation du site */}
				<Navigation
					theme={session.user.preferences.theme}
					source={meta.source}
				/>

				{/* Menu utilisateur */}
				<UserMenu session={session} />
			</header>

			<div className="space-y-6 px-4 pb-12 pt-6 md:p-10">
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
				<Separator className="my-6" />

				<main className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					{/* Routes de navigation */}
					<Routes />

					{/* Contenu principal */}
					<section className="flex-1 space-y-6 lg:max-w-2xl">
						{children}
					</section>
				</main>
			</div>
		</>
	);
}