//
// Route vers la page de paramétrage de la confidentialité.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Privacy = lazy( () => import( "../components/privacy" ) );

// Affichage de la page.
export default function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">
					Gestion de la confidentialité
				</h3>

				<p className="text-sm text-muted-foreground">
					Vous voulez effacer vos traces et faire comme si vous
					n&lsquo;aviez jamais utilisé le site ? C&lsquo;est ici que
					ça se passe !
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de gestion de la confidentialité */}
			<Privacy />
		</>
	);
}