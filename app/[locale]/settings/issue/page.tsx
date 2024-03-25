//
// Route vers la page de signalement des bogues.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Issue = lazy( () => import( "../components/issue" ) );

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
	const messages = await getTranslations();

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">
					{messages( "navigation.issue_title" )}
				</h3>

				<p className="text-sm text-muted-foreground">
					{messages( "settings.issue" )}
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de signalement d'un bogue */}
			<Issue />
		</>
	);
}