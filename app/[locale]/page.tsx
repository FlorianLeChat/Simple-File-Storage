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
	PocketKnife } from "lucide-react";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { merge } from "@/utilities/tailwind";

// Importation des composants.
import { buttonVariants } from "./components/ui/button";

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Accueil – Simple File Storage"
};

// Affichage de la page.
export default function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="mb-auto flex items-center justify-between gap-2 p-4 max-sm:flex-col">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold">
					💾 Simple File Storage
				</h1>

				{/* Bouton vers l'authentification */}
				<Link
					href="/authentication"
					className={merge(
						buttonVariants( { variant: "outline" } ),
						"sm:mr-16"
					)}
				>
					<LogIn className="mr-2 h-5 w-5" />
					Authentification
				</Link>

				{/* Affichage de l'animation du logo vers le dépôt GitHub */}
				{/* Source : https://tholman.com/github-corners/ */}
				<a
					rel="noopener noreferrer"
					href="https://github.com/FlorianLeChat/Simple-File-Storage"
					target="_blank"
					className="group fixed bottom-auto left-auto right-0 top-0 [clip-path:polygon(0_0,100%_0,100%_100%)] max-sm:hidden"
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
			<section className="container mx-auto p-4 text-center">
				<h2 className="bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tighter dark:from-white dark:to-gray-500 dark:text-transparent sm:text-5xl xl:text-6xl/none">
					Découvrez nos fonctionnalités
				</h2>

				<p className="mx-auto mt-2 max-w-[600px] md:text-xl">
					Nos fonctionnalités sont conçues pour garantir votre
					confidentialité et protéger vos données.
				</p>

				<div className="grid gap-8 max-xl:mt-8 md:grid-cols-3 xl:mt-[5%]">
					<article className="space-y-2 p-4">
						<Lock className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							Sécurisé de bout en bout
						</h2>

						<p className="text-muted-foreground">
							Toutes les données sont chiffrées et stockées sur
							des serveurs sécurisés et à l&lsquo;abri des regards
							indiscrets.
						</p>
					</article>

					<article className="space-y-2 p-4">
						<Smile className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							Simple d&lsquo;utilisation
						</h2>

						<p className="text-muted-foreground">
							L&lsquo;interface est conçue pour être simple et
							ergonomique pour tous les utilisateurs, même pour
							vos grands-parents.
						</p>
					</article>

					<article className="space-y-2 p-4">
						<Eye className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							Respect de la vie privée
						</h2>

						<p className="text-muted-foreground">
							Vos données sont stockées sur des serveurs basés en
							Europe conforme au RGPD pour garantir une intégrité
							et une confidentialité totale.
						</p>
					</article>

					<article className="space-y-2 p-4">
						<Zap className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">Haute performance</h2>

						<p className="text-muted-foreground">
							Nos serveurs sont prévus pour garantir une
							performance optimale et une disponibilité maximale.
						</p>
					</article>

					<article className="space-y-2 p-4">
						<PocketKnife className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">Outils efficaces</h2>

						<p className="text-muted-foreground">
							Nos outils sont peu nombreux mais efficaces pour
							l&lsquo;enregistrement et le partage de vos fichiers
							avec d&lsquo;autres utilisateurs.
						</p>
					</article>

					<article className="space-y-2 p-4">
						<Share2 className="mx-auto mb-2 h-6 w-6" />

						<h2 className="text-xl font-bold">
							Espace de stockage partagé
						</h2>

						<p className="text-muted-foreground">
							Nous ne pouvons pas vous garantir un espace de
							stockage illimité, mais il permet de stocker
							suffisamment de fichiers pour vos besoins
							quotidiens.
						</p>
					</article>
				</div>
			</section>
		</>
	);
}