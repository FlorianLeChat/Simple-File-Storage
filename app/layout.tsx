//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation de la feuille de style globale.
import "./layout.css";

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import { type ReactNode } from "react";

export default async function RootLayout( { children }: { children: ReactNode } )
{
	// Affichage du rendu HTML de la page.
	return (
		<html lang="fr">
			<body>{children}</body>
		</html>
	);
}