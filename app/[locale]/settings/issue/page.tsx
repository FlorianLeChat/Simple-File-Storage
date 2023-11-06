//
// Route vers la page de signalement des bogues.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Issue = lazy( () => import( "../components/issue" ) );

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
					Signalement d&lsquo;un bogue
				</h3>

				<p className="text-sm text-muted-foreground">
					Vous avez trouvé un bogue ? Signalez-le ici.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de signalement d'un bogue */}
			<Issue />
		</>
	);
}