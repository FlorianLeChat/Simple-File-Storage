//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Importation des dépendances.
import Link from "next/link";
import { Eye,
	Zap,
	Lock,
	Smile,
	LogIn,
	Share2,
	Cookie,
	PocketKnife,
	LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata as getMetadata } from "./layout";

// Importation des composants.
import { Button, buttonVariants } from "./components/ui/button";

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
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await getMetadata();
	const session = await auth();
	const messages = await getTranslations();

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="mb-auto flex items-center gap-4 p-4 max-sm:mt-4 max-sm:flex-col">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold max-sm:w-full max-sm:max-w-fit max-sm:overflow-hidden max-sm:text-ellipsis max-sm:whitespace-nowrap">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

				<nav className="flex gap-4 sm:ml-auto">
					{/* Bouton vers l'authentification */}
					{session ? (
						<Link
							href="/dashboard"
							className={buttonVariants( { variant: "outline" } )}
						>
							<LayoutDashboard className="h-5 w-5" />

							<span className="max-sm:sr-only sm:ml-2">
								{messages( "header.dashboard" )}
							</span>
						</Link>
					) : (
						<Link
							href="/authentication"
							className={buttonVariants( { variant: "outline" } )}
						>
							<LogIn className="mr-2 h-5 w-5" />

							<span className="max-sm:sr-only sm:ml-2">
								{messages( "header.authenticate" )}
							</span>
						</Link>
					)}

					{/* Gestion des cookies */}
					<Button
						type="button"
						variant="outline"
						data-cc="show-preferencesModal"
						className="justify-start text-left sm:mr-16"
					>
						<Cookie />

						<span className="sr-only">
							{messages( "navigation.cookies_title" )}

							<small className="hidden lg:block">
								{messages.rich(
									"navigation.cookies_description",
									{
										u: ( chunks ) => <u>{chunks}</u>
									}
								)}
							</small>
						</span>
					</Button>
				</nav>

				{/* Affichage de l'animation du logo vers le dépôt GitHub */}
				{/* Source : https://tholman.com/github-corners/ */}
				<a
					rel="noopener noreferrer"
					href={meta.source}
					target="_blank"
					className="group fixed bottom-auto left-auto right-0 top-0 [clip-path:polygon(0_0,100%_0,100%_100%)] max-sm:hidden"
					aria-label="GitHub"
				>
					<svg
						width="80"
						height="80"
						viewBox="0 0 250 250"
						className="fill-primary text-background"
					>
						<path d="M0 0l115 115h15l12 27 108 108V0z" />
						<path
							d="M128 109c-15-9-9-19-9-19 3-7 2-11 2-11-1-7 3-2 3-2 4 5 2 11 2 11-3 10 5 15 9 16"
							className="origin-[130px_106px] fill-current max-md:motion-safe:animate-github md:motion-safe:group-hover:animate-github"
						/>
						<path
							d="M115 115s4 2 5 0l14-14c3-2 6-3 8-3-8-11-15-24 2-41 5-5 10-7 16-7 1-2 3-7 12-11 0 0
							5 3 7 16 4 2 8 5 12 9s7 8 9 12c14 3 17 7 17 7-4 8-9 11-11 11 0 6-2 11-7 16-16 16-30 10-41
							2 0 3-1 7-5 11l-12 11c-1 1 1 5 1 5z"
							className="fill-current"
						/>
					</svg>
				</a>
			</header>

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
						<Lock className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_1" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_1" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Smile className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_2" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_2" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Eye className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_3" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_3" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Zap className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							{" "}
							{messages( "index.features.title_4" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_4" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<PocketKnife className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							{messages( "index.features.title_5" )}
						</h2>

						<p className="text-muted-foreground">
							{messages( "index.features.description_5" )}
						</p>
					</li>

					<li className="space-y-2 p-4">
						<Share2 className="mx-auto mb-2 h-6 w-6" />

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