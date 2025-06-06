//
// Route vers la page de paramétrage de l'apparence.
//

// Importation des dépendances.
import { lazy } from "react";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Appearance = lazy( () => import( "../components/appearance" ) );

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
					{messages( "navigation.layout_title" )}
				</h3>

				<p className="text-sm text-muted-foreground">
					{messages( "settings.layout" )}
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification de l'apparence */}
			<Appearance session={session} />
		</>
	);
}