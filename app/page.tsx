//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Importation des dépendances.
import { lazy } from "react";
import type { Metadata } from "next";

// Importation des composants.

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Accueil – Simple File Storage"
};

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			<header>
				{/* Titre du site */}
				<h1 className="absolute top-4 w-full text-center text-xl font-semibold sm:left-4 sm:w-auto sm:text-left">
					💾 Simple File Storage
				</h1>
			</header>

			{/* Contenu de la page */}
			<main className="flex h-screen items-center" />
		</>
	);
}