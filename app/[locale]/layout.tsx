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
import { unstable_setRequestLocale } from "next-intl/server";
import { Suspense, lazy, type ReactNode } from "react";

// Importation des composants.
import Footer from "./components/footer";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";

const Analytics = lazy( () => import( "./components/analytics" ) );
const CookieConsent = lazy( () => import( "./components/cookie-consent" ) );

// Génération des paramètres pour les pages statiques.
export function generateStaticParams()
{
	return [ "en", "fr" ].map( ( locale ) => ( { locale } ) );
}

// Création de la police de caractères Inter.
const inter = Inter( {
	subsets: [ "latin" ],
	display: "swap"
} );

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
		<html lang="fr" className={inter.className}>
			<body className="flex min-h-screen flex-col">
				<Suspense>
					{/* Vidéo en arrière-plan */}
					<video
						loop
						muted
						autoPlay
						className="absolute -z-10 hidden h-full object-none opacity-[0.05] dark:block"
					>
						<source
							src={`${ process.env.__NEXT_ROUTER_BASEPATH }/assets/videos/background.mp4`}
							type="video/mp4"
						/>
					</video>

					{/* Basculement entre les thèmes */}
					<ThemeProvider>
						{/* Composant enfant */}
						{children}

						{/* Consentement des cookies */}
						<CookieConsent />

						{/* Google Analytics */}
						<Analytics />

						{/* Composant des notifications */}
						<Toaster />

						{/* Pied de page */}
						<Footer />
					</ThemeProvider>
				</Suspense>
			</body>
		</html>
	);
}