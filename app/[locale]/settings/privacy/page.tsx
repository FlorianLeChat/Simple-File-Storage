//
// Route vers la page de paramétrage de la confidentialité.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Privacy = lazy( () => import( "../components/privacy" ) );

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
					{messages( "navigation.privacy_title" )}
				</h3>

				<p className="text-sm text-muted-foreground">
					{messages( "settings.privacy" )}
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de gestion de la confidentialité */}
			<Privacy />
		</>
	);
}