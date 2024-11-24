//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Importation des dépendances.
import { lazy } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Eye, Zap, Lock, Smile, Share2, PocketKnife } from "lucide-react";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata as getMetadata } from "./layout";

// Importation des composants.
const Header = lazy( () => import( "./components/header" ) );

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<Metadata>
{
	const metadata = await getMetadata();
	const messages = await getTranslations();

	return {
		title: `${ messages( "header.home" ) } – ${ metadata.title }`
	};
}

// Affichage de la page.
export default async function Page( {
	params
}: {
	params: Promise<{ locale: string }>;
} )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await getMetadata();
	const session = await auth();
	const messages = await getTranslations();

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<Header meta={meta} session={session} />

			{/* Contenu de la page */}
			<section className="container mx-auto mb-4 p-4 text-center">
				<h2 className="hyphens-auto bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tighter dark:from-white dark:to-gray-500 dark:text-transparent sm:text-5xl xl:text-6xl">
					{messages( "index.title" )}
				</h2>

				<p className="mx-auto mt-2 max-w-[600px] md:text-xl">
					{messages( "index.subtitle" )}
				</p>

				<ul className="grid gap-4 max-xl:mt-8 md:grid-cols-3 md:gap-8 xl:mt-[5%]">
					<li className="space-y-2 p-4">
						<Lock className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_1" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_1" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Smile className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_2" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_2" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Eye className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_3" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_3" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Zap className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_4" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_4" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<PocketKnife className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_5" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_5" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Share2 className="mx-auto mb-2 size-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_6" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_6" )}
						</p>
					</li>
				</ul>
			</section>
		</>
	);
}