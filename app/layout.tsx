//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation de la feuille de style globale.
import "./layout.css";

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import { Inter } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Suspense, type ReactNode } from "react";

// Importation des composants.
import Loading from "./loading";
import { Toaster } from "./components/ui/toaster";

// Modification de la configuration de Font Awesome.
//  Source : https://fontawesome.com/docs/web/use-with/react/use-with
config.autoAddCss = false;

// Création de la police de caractères Inter.
const inter = Inter( {
	subsets: [ "latin" ],
	display: "swap"
} );

export default function Layout( { children }: { children: ReactNode } )
{
	// Affichage du rendu HTML de la page.
	return (
		<html lang="fr" className={`${ inter.className } dark`}>
			<body>
				<Suspense fallback={<Loading title="Simple File Storage" />}>
					{children}
				</Suspense>

				<Toaster />
			</body>
		</html>
	);
}