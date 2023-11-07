//
// Structure HTML générale des paramètres utilisateur.
//

// Importation des dépendances.
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "./components/navigation" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Paramètres – Simple File Storage"
};

export default function Layout( {
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="flex min-h-[4rem] flex-wrap justify-center gap-2 border-b p-4 max-md:flex-col">
				<div className="align-center flex items-center gap-2 max-md:flex-col md:gap-4">
					{/* Titre du site */}
					<h1 className="text-xl font-semibold">
						💾 Simple File Storage
					</h1>

					{/* Éléments de navigation */}
					<Header />
				</div>

				{/* Menu utilisateur */}
				<UserMenu />
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
					{/* Navigation latérale */}
					<Navigation />

					{/* Contenu principal */}
					<section className="flex-1 space-y-6 lg:max-w-2xl">
						{children}
					</section>
				</main>
			</div>
		</>
	);
}