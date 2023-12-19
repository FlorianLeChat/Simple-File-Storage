//
// Structure HTML générale des paramètres utilisateur.
//

// Importation des dépendances.
import { readdir } from "fs/promises";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "./components/navigation" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Paramètres – Simple File Storage"
};

export default async function Layout( {
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Vérification de la session utilisateur.
	const session = await auth();

	if ( !session )
	{
		redirect( "/" );
	}

	// Récupération de l'avatar utilisateur.
	if ( !session.user.image )
	{
		const avatar = await readdir( "./public/avatars" );

		if ( avatar.length > 0 )
		{
			session.user.image = `/avatars/${ avatar[ 0 ] }`;
		}
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="flex min-h-[4rem] flex-wrap justify-center gap-2 border-b p-4 max-md:flex-col">
				<div className="align-center flex items-center gap-2 max-md:flex-col md:gap-4">
					{/* Titre du site */}
					<h1 className="text-xl font-semibold">
						💾 Simple File Storage
					</h1>

					{/* Éléments de navigation */}
					<Header />
				</div>

				{/* Menu utilisateur */}
				<UserMenu session={session} />
			</header>

			<div className="space-y-6 px-4 pb-12 pt-6 md:p-10">
				{/* En-tête de la page */}
				<header>
					<h2 className="text-2xl font-bold tracking-tight">
						Paramètres généraux
					</h2>

					<p className="text-muted-foreground">
						Gérer les paramètres de votre compte et du site.
					</p>
				</header>

				{/* Barre verticale de séparation */}
				<Separator className="my-6" />

				<main className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					{/* Navigation latérale */}
					<Navigation />

					{/* Contenu principal */}
					<section className="flex-1 space-y-6 lg:max-w-2xl">
						{children}
					</section>
				</main>
			</div>
		</>
	);
}