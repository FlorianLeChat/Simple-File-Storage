//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation de la feuille de style globale.
import "./layout.css";

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import { Inter, Poppins, Roboto } from "next/font/google";
import { unstable_setRequestLocale } from "next-intl/server";
import { Suspense, lazy, type ReactNode, type CSSProperties } from "react";

// Importation des composants.
import Footer from "./components/footer";
import { Toaster } from "./components/ui/toaster";
import { LayoutProvider } from "./components/layout-provider";

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

const poppins = Poppins( {
	weight: [ "100", "200", "300", "400", "500", "600", "700", "800", "900" ],
	subsets: [ "latin" ],
	display: "swap"
} );

const roboto = Roboto( {
	weight: [ "100", "300", "400", "500", "700", "900" ],
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
		<html
			lang={locale}
			style={
				{
					"--inter-font": inter.style.fontFamily,
					"--poppins-font": poppins.style.fontFamily,
					"--roboto-font": roboto.style.fontFamily
				} as CSSProperties
			}
		>
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
					<LayoutProvider>
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
					</LayoutProvider>
				</Suspense>
			</body>
		</html>
	);
}