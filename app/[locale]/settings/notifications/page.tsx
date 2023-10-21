//
// Route vers la page de paramétrage des notifications.
//

// Importation des dépendances.
import { lazy } from "react";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Notifications = lazy( () => import( "../components/notifications" ) );

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">Notifications</h3>

				<p className="text-sm text-muted-foreground">
					Choisissez les notifications que vous souhaitez recevoir par
					courriel ou directement sur le site Internet.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de signalement d'un bogue */}
			<Notifications />
		</>
	);
}