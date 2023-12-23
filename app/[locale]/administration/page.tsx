//
// Route vers la page d'administration du site.
//

// Importation des dépendances.
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
const Administration = dynamic( () => import( "../components/administration" ), {
	ssr: false
} );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Administration – Simple File Storage"
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
	const session = await auth();

	if ( !session || session.user.role !== "admin" )
	{
		redirect( "/" );
	}

	// Affichage du rendu HTML de la page.
	return <Administration />;
}