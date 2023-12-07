//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation de la feuille de style globale.
import "./layout.css";

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import { join } from "path";
import { Inter, Poppins, Roboto } from "next/font/google";
import { unstable_setRequestLocale } from "next-intl/server";
import { promises as fileSystem, existsSync } from "fs";
import { Suspense, lazy, type ReactNode, type CSSProperties } from "react";

// Importation des types.
import type { Metadata, Viewport } from "next";

// Importation des composants.
import Footer from "./components/footer";

const Toaster = lazy( () => import( "./components/ui/toaster" ) );
const Recaptcha = lazy( () => import( "./components/recaptcha" ) );
const CookieConsent = lazy( () => import( "./components/cookie-consent" ) );
const LayoutProvider = lazy( () => import( "./components/layout-provider" ) );

// Déclaration des paramètres d'affichage.
export const viewport: Viewport = {
	themeColor: "#3b82f6",
	viewportFit: "cover"
};

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<
	Metadata & { source: string }
	>
{
	// On vérifie d'abord si les métadonnées sont déjà enregistrées
	//  dans le cache du système de fichiers.
	const path = `${ join( process.cwd(), "public/data" ) }/metadata.json`;

	if ( existsSync( path ) )
	{
		return JSON.parse(
			await fileSystem.readFile( path, "utf8" )
		) as Metadata & { source: string };
	}

	// On récupère ensuite les informations du dépôt GitHub,
	//  ceux de l'auteur et le dernier commit.
	const repository = ( await (
		await fetch(
			"https://api.github.com/repos/FlorianLeChat/Simple-File-Storage",
			{
				cache: "force-cache"
			}
		)
	).json() ) as Record<string, string>;

	const author = ( await (
		await fetch( "https://api.github.com/users/FlorianLeChat", {
			cache: "force-cache"
		} )
	).json() ) as Record<string, string>;

	const commits = ( await (
		await fetch(
			"https://api.github.com/repos/FlorianLeChat/Simple-File-Storage/commits/master",
			{
				cache: "force-cache"
			}
		)
	).json() ) as Record<string, string>;

	// On détermine après certaines métadonnées récurrentes.
	const banner = `https://opengraph.githubassets.com/${ commits.sha }/${ repository.full_name }`;
	const url =
		process.env.NEXT_PUBLIC_ENV === "production"
			? repository.homepage
			: `http://localhost:3000${ process.env.__NEXT_ROUTER_BASEPATH }`;

	// On retourne enfin les métadonnées récupérées récemment
	//  avant de les enregistrer dans un fichier JSON.
	const metadata = {
		// Métadonnées du document.
		title: repository.name,
		source: repository.html_url,
		authors: [ { name: author.name, url: author.html_url } ],
		keywords: repository.topics,
		description: repository.description,
		metadataBase: new URL( url ),

		// Icônes du document.
		icons: {
			icon: [
				{
					url: "assets/favicons/16x16.webp",
					type: "image/webp",
					sizes: "16x16"
				},
				{
					url: "assets/favicons/32x32.webp",
					type: "image/webp",
					sizes: "32x32"
				},
				{
					url: "assets/favicons/48x48.webp",
					type: "image/webp",
					sizes: "48x48"
				},
				{
					url: "assets/favicons/192x192.webp",
					type: "image/webp",
					sizes: "192x192"
				},
				{
					url: "assets/favicons/512x512.webp",
					type: "image/webp",
					sizes: "512x512"
				}
			],
			apple: [
				{
					url: "assets/favicons/180x180.webp",
					type: "image/webp",
					sizes: "180x180"
				}
			]
		},

		// Informations pour les moteurs de recherche.
		openGraph: {
			url,
			type: "website",
			title: repository.name,
			description: repository.description,
			images: [
				{
					url: banner
				}
			]
		},

		// Informations pour la plate-forme Twitter.
		twitter: {
			title: repository.name,
			creator: `@${ author.twitter_username }`,
			description: repository.description,
			images: [
				{
					url: banner
				}
			]
		}
	};

	await fileSystem.writeFile( path, JSON.stringify( metadata ) );

	return metadata;
}

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

						{/* Google reCAPTCHA */}
						<Recaptcha />

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