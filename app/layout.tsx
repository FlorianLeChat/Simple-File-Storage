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
import { Suspense, lazy, type ReactNode } from "react";

// Importation des composants.
import { Toaster } from "./components/ui/toaster";
import ThemeProvider from "./components/theme-provider";

const CookieConsent = lazy( () => import( "./components/cookie-consent" ) );

// Création de la police de caractères Inter.
const inter = Inter( {
	subsets: [ "latin" ],
	display: "swap"
} );

export default function Layout( { children }: { children: ReactNode } )
{
	// Affichage du rendu HTML de la page.
	return (
		<html lang="fr" className={inter.className}>
			<body>
				<Suspense>
					{/* Basculement entre les thèmes clair et sombre. */}
					<ThemeProvider
						attribute="class"
						storageKey="NEXT_THEME"
						disableTransitionOnChange
					>
						{/* Composant enfant */}
						{children}

						{/* Consentement des cookies */}
						<CookieConsent />

						{/* Composant des notifications */}
						<Toaster />
					</ThemeProvider>
				</Suspense>
			</body>
		</html>
	);
}