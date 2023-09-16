//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { UserAuthForm } from "./components/auth-form";
import { buttonVariants } from "./components/ui/button";

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

			{/* Vidéo en arrère-plan */}
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
				<section className="flex w-full flex-col justify-center space-y-6 text-center sm:mx-auto sm:w-[350px]">
					<h2 className="text-2xl font-semibold tracking-tight">
						Créer un compte
					</h2>

					<p className="text-sm text-muted-foreground">
						Entrer votre adresse électronique pour créer un compte.
					</p>

					<UserAuthForm />

					<p className="px-8 text-center text-sm text-muted-foreground">
						En continuant, vous acceptez nos
						{" "}
						<Link
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Conditions d&lsquo;utilisation
						</Link>
						{" "}
						et notre
						{" "}
						<Link
							href="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Politique de confidentialité
						</Link>
						.
					</p>
				</section>
			</main>

			<blockquote className="absolute bottom-4 left-4">
				<q className="text-md">
					{" "}
					A simple file storage system using HTML 5/CSS 3 and PHP 8
					vanilla.
					{" "}
				</q>

				<footer className="text-sm">FlorianLeChat</footer>
			</blockquote>
		</>
	);
}