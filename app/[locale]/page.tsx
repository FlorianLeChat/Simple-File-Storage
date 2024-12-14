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
const BlurIn = lazy( () => import( "./components/ui/thirdparty/blur-in" ) );
const FadeText = lazy( () => import( "./components/ui/thirdparty/fade-text" ) );
const WordPullUp = lazy(
	() => import( "./components/ui/thirdparty/word-pull-up" )
);

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
}: Readonly<{
	params: Promise<{ locale: string }>;
}> )
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
				<WordPullUp
					as="h2"
					words={messages( "index.title" )}
					className="hyphens-auto bg-clip-text text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl"
				/>

				<FadeText
					as="p"
					delay={0.8}
					className="mx-auto mt-2 max-w-[600px] md:text-xl"
					direction="up"
				>
					{messages( "index.subtitle" )}
				</FadeText>

				<ul className="grid gap-4 max-xl:mt-8 md:grid-cols-3 md:gap-8 xl:mt-[5%]">
					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={0.9}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Lock className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={0.9}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_1" )}
						</FadeText>

						<FadeText
							as="p"
							delay={1.1}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_1" )}
						</FadeText>
					</li>

					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={1.2}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Smile className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={1.2}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_2" )}
						</FadeText>

						<FadeText
							as="p"
							delay={1.4}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_2" )}
						</FadeText>
					</li>

					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={1.5}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Eye className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={1.5}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_3" )}
						</FadeText>

						<FadeText
							as="p"
							delay={1.7}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_3" )}
						</FadeText>
					</li>

					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={1.8}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Zap className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={1.8}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_3" )}
						</FadeText>

						<FadeText
							as="p"
							delay={2}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_3" )}
						</FadeText>
					</li>

					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={2.1}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<PocketKnife className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={2.1}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_5" )}
						</FadeText>

						<FadeText
							as="p"
							delay={2.3}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_5" )}
						</FadeText>
					</li>

					<li className="space-y-2 p-4">
						<BlurIn
							as="div"
							delay={2.4}
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Share2 className="mx-auto mb-2 size-6" />
						</BlurIn>

						<FadeText
							as="h2"
							delay={2.4}
							className="text-xl font-bold"
							direction="down"
						>
							{messages( "index.features.title_6" )}
						</FadeText>

						<FadeText
							as="p"
							delay={2.6}
							className="text-muted-foreground"
							direction="down"
						>
							{messages( "index.features.description_6" )}
						</FadeText>
					</li>
				</ul>
			</section>
		</>
	);
}