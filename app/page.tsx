//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

import Link from "next/link";
import { cn } from "@/utilities/tailwind";
import { UserAuthForm } from "./components/auth-form";
import { buttonVariants } from "./components/ui/button";

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<main className="h-screen items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<Link
				href="/examples/authentication"
				className={cn(
					buttonVariants( { variant: "ghost" } ),
					"absolute right-4 top-4 md:right-8 md:top-8"
				)}
			>
				Connexion
			</Link>

			<video className="relative object-cover blur-sm hidden w-full h-full lg:flex" autoPlay muted loop>
				<source src={`${ process.env.__NEXT_ROUTER_BASEPATH }/assets/videos/login.mp4`} type="video/mp4" />
			</video>

			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							Créer un compte
						</h1>

						<p className="text-sm text-muted-foreground">
							Entrer votre adresse électronique pour créer un compte.
						</p>
					</div>

					<UserAuthForm />

					<p className="px-8 text-center text-sm text-muted-foreground">
						En continuant, vous acceptez nos
						{" "}
						<Link
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Conditions d&#39;utilisation
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
				</div>
			</div>
		</main>
	);
}