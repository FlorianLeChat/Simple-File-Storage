//
// Structure HTML générale des paramètres utilisateur.
//

// Importation des dépendances.
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "./components/navigation" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Paramètres – Simple File Storage"
};

export default function Layout( { children }: { children: ReactNode } )
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="flex min-h-[4rem] justify-center gap-4 border-b sm:px-4">
				<div className="align-center flex flex-col items-center gap-2 pb-3 pt-4 sm:flex-row sm:gap-4 sm:py-0">
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

			<div className="space-y-6 p-4 pb-12 md:p-10">
				{/* En-tête de la page */}
				<header className="space-y-0.5">
					<h2 className="text-2xl font-bold tracking-tight">
						Paramètres générales
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