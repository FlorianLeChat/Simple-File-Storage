//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Importation des dépendances.
import Link from "next/link";
import { lazy } from "react";
import { merge } from "@/utilities/tailwind";

// Importation des composants.
import { buttonVariants } from "./components/ui/button";

const AuthForm = lazy( () => import( "./components/auth-form" ) );

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			<header>
				{/* Titre du site */}
				<h1 className="absolute left-4 top-4 text-xl font-semibold">
					💾 Simple File Storage
				</h1>

				{/* Redirection vers la connexion */}
				<Link
					href="/authentication"
					className={merge(
						buttonVariants( { variant: "outline" } ),
						"absolute right-4 top-4 hover:bg-accent hover:text-accent-foreground"
					)}
				>
					Connexion
				</Link>
			</header>

			{/* Vidéo en arrière-plan */}
			<video
				className="absolute -z-10 h-full object-none opacity-10"
				autoPlay
				muted
				loop
			>
				<source
					src={`${ process.env.__NEXT_ROUTER_BASEPATH }/assets/videos/login.mp4`}
					type="video/mp4"
				/>
			</video>

			{/* Contenu de la page */}
			<main className="flex h-screen items-center">
				<AuthForm />
			</main>

			<blockquote className="absolute bottom-4 left-4">
				<q className="text-md">
					{" "}
					A simple file storage system using HTML 5/CSS 3 and PHP 8
					vanilla.{" "}
				</q>

				<footer className="text-sm">FlorianLeChat</footer>
			</blockquote>
		</>
	);
}