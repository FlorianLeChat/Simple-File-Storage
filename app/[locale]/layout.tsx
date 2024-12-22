//
// Structure HTML générale des pages du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
//

// Importation du normalisateur TypeScript.
import "@total-typescript/ts-reset";

// Importation des dépendances.
import pick from "lodash/pick";
import type { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";
import { lazy,
	Suspense,
	type ReactNode,
	type CSSProperties,
	type ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Inter, Poppins, Roboto } from "next/font/google";
import { setRequestLocale, getMessages } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { getLanguages } from "@/utilities/i18n";
import { fetchMetadata } from "@/utilities/metadata";

// Importation des types.
import type { Viewport } from "next";

// Importation des composants.
import Footer from "./components/footer";

const Sonner = lazy( () => import( "./components/ui/sonner" ) );
const Recaptcha = lazy( () => import( "./components/recaptcha" ) );
const CookieConsent = lazy( () => import( "./components/cookie-consent" ) );

// Déclaration des paramètres d'affichage.
export const viewport: Viewport = {
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#3b82f6" }
	]
};

// Déclaration des propriétés de la page.
export async function generateMetadata()
{
	return fetchMetadata();
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
}: Readonly<{
	children: ReactNode;
	params: Promise<{ locale: string }>;
}> )
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
	const isDarkMode = theme === "dark";

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
			className={`${ font } ${ color } ${ factory ? theme : "light" } antialiased ${ isDarkMode ? "cc--darkmode" : "" }`}
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

								if (target === "dark") {
									element.classList.add("cc--darkmode");
								}
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
								src="/assets/videos/background.mp4"
								type="video/mp4"
							/>
						</video>

						{/* Composant enfant */}
						<MotionConfig reducedMotion="user">
							{children}
						</MotionConfig>

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