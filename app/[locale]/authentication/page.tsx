//
// Route vers la page d'authentification du site.
//

// Importation des dépendances.
import { lazy } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des composants.
const AuthForm = lazy( () => import( "../components/auth-form" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Authentification – Simple File Storage"
};

// Affichage de la page.
export default async function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Vérification de la session utilisateur.
	const session = await getServerSession();

	if ( session )
	{
		redirect( "/dashboard" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="mt-auto p-4 text-center">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold">
					💾 Simple File Storage
				</h1>
			</header>

			{/* Contenu de la page */}
			<main className="p-4">
				<AuthForm />
			</main>
		</>
	);
}