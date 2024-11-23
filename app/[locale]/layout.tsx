//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import pick from "lodash/pick";
import { join } from "path";
import { existsSync } from "fs";
import type { Toaster } from "sonner";
import { lazy,
	Suspense,
	type ReactNode,
	type CSSProperties,
	type ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Inter, Poppins, Roboto } from "next/font/google";
import { mkdir, readFile, writeFile } from "fs/promises";
import { setRequestLocale, getMessages } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { getLanguages } from "@/utilities/i18n";

// Importation des types.
import type { Metadata, Viewport } from "next";

// Importation des composants.
import Footer from "./components/footer";

const Sonner = lazy( () => import( "./components/ui/sonner" ) );
const Recaptcha = lazy( () => import( "./components/recaptcha" ) );
const CookieConsent = lazy( () => import( "./components/cookie-consent" ) );

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
	const folderPath = join( process.cwd(), "data" );
	const filePath = join( folderPath, "metadata.json" );

	await mkdir( folderPath, { recursive: true } );

	if ( existsSync( filePath ) )
	{
		return JSON.parse( await readFile( filePath, "utf8" ) ) as Metadata & {
			source: string;
		};
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
	const title = repository.name.replaceAll( "-", " " );
	const url =
		process.env.NEXT_PUBLIC_ENV === "production"
			? repository.homepage
			: `http://localhost:3000${ process.env.__NEXT_ROUTER_BASEPATH }`;

	// On retourne également les métadonnées récupérées récemment
	//  avant de les enregistrer dans un fichier JSON.
	const metadata = {
		// Métadonnées du document.
		title,
		source: repository.html_url,
		authors: [ { name: author.name, url: author.html_url } ],
		keywords: repository.topics,
		description: repository.description,
		metadataBase: new URL( url ),

		// Icônes du document.
		icons: {
			icon: [
				{
					url: `${ url }/assets/favicons/16x16.webp`,
					type: "image/webp",
					sizes: "16x16"
				},
				{
					url: `${ url }/assets/favicons/32x32.webp`,
					type: "image/webp",
					sizes: "32x32"
				},
				{
					url: `${ url }/assets/favicons/48x48.webp`,
					type: "image/webp",
					sizes: "48x48"
				},
				{
					url: `${ url }/assets/favicons/192x192.webp`,
					type: "image/webp",
					sizes: "192x192"
				},
				{
					url: `${ url }/assets/favicons/512x512.webp`,
					type: "image/webp",
					sizes: "512x512"
				}
			],
			apple: [
				{
					url: `${ url }/assets/favicons/180x180.webp`,
					type: "image/webp",
					sizes: "180x180"
				}
			]
		},

		// Informations pour les moteurs de recherche.
		openGraph: {
			url,
			type: "website",
			title,
			description: repository.description,
			images: [
				{
					url: banner
				}
			]
		},

		// Informations pour la plate-forme Twitter.
		twitter: {
			title,
			creator: `@${ author.twitter_username }`,
			description: repository.description,
			images: [
				{
					url: banner
				}
			]
		}
	};

	// On enregistre enfin les métadonnées dans un fichier JSON
	//  avant de les retourner.
	logger.warn(
		{ source: __dirname, metadata },
		"Loading metadata from GitHub API"
	);

	await writeFile( filePath, JSON.stringify( metadata ) );

	return metadata;
}

// Génération des paramètres pour les pages statiques.
const languages = getLanguages();

export function generateStaticParams()
{
	return languages.map( ( locale ) => ( { locale } ) );
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

// Récupération du typage des notifications.
type ToasterProps = ComponentProps<typeof Toaster>;

export default async function Layout( {
	children,
	params
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
} )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Vérification du support de la langue.
	if ( !languages.includes( locale ) )
	{
		logger.error( { source: __dirname, locale }, "Unsupported language" );
		return null;
	}

	// Déclaration des constantes.
	const session = await auth();
	const messages = await getMessages();

	// Récupération des préférences de l'utilisateur.
	const font = session?.user.preferences?.font ?? "inter";
	const theme = session?.user.preferences?.theme ?? "light";
	const color = session?.user.preferences?.color ?? "blue";
	const factory = session?.user.preferences?.default ?? true;

	// Affichage du rendu HTML de la page.
	return (
		<html
			lang={locale}
			style={
				{
					colorScheme: theme,
					"--inter-font": inter.style.fontFamily,
					"--poppins-font": poppins.style.fontFamily,
					"--roboto-font": roboto.style.fontFamily
				} as CSSProperties
			}
			className={`${ font } ${ color } ${ factory ? theme : "light" } antialiased`}
			suppressHydrationWarning
		>
			{/* En-tête de la page */}
			<head>
				{/* Mise à jour de l'apparence (utilisateurs anonymes ou sans préférences) */}
				{( !session || session?.user.preferences?.default ) && (
					<script
						dangerouslySetInnerHTML={{
							__html: `
								// Application du thème préféré par le navigateur.
								const element = document.documentElement;
								const target = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

								element.classList.remove("light", "dark");
								element.classList.add(target);
								element.style.colorScheme = target;
							`
						}}
					/>
				)}
			</head>

			{/* Corps de la page */}
			<body className="flex min-h-screen flex-col">
				{/* Écran de chargement de la page */}
				<Suspense>
					{/* Utilisation des traductions */}
					<NextIntlClientProvider
						locale={locale}
						messages={pick(
							messages,
							"form",
							"modals",
							"header",
							"valibot",
							"actions",
							"settings",
							"dashboard",
							"navigation",
							"consentModal",
							"preferencesModal"
						)}
						timeZone={process.env.TZ}
					>
						{/* Vidéo en arrière-plan */}
						<video
							loop
							muted
							autoPlay
							className="fixed -z-10 hidden size-full object-none opacity-10 dark:block"
						>
							<source
								src={`${ process.env.__NEXT_ROUTER_BASEPATH }/assets/videos/background.mp4`}
								type="video/mp4"
							/>
						</video>

						{/* Composant enfant */}
						{children}

						{/* Consentement des cookies */}
						<CookieConsent />

						{/* Google reCAPTCHA */}
						<Recaptcha />

						{/* Composant des notifications */}
						<Sonner
							theme={
								( session && !session?.user.preferences?.default
									? theme
									: "system" ) as ToasterProps["theme"]
							}
						/>

						{/* Pied de page */}
						<Footer />
					</NextIntlClientProvider>
				</Suspense>
			</body>
		</html>
	);
}