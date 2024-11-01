//
// Route vers la page de paramétrage du stockage.
//

// Importation des dépendances.
import { lazy } from "react";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Storage = lazy( () => import( "../components/storage" ) );

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
	const session = await auth();
	const messages = await getTranslations();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">
					{messages( "navigation.storage_title" )}
				</h3>

				<p className="text-sm text-muted-foreground">
					{messages( "settings.storage" )}
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de gestion de la confidentialité */}
			<Storage session={session} />
		</>
	);
}