//
// Route vers la page de paramétrage des notifications.
//

// Importation des dépendances.
import { lazy } from "react";
import { type Session } from "next-auth";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Notifications = lazy( () => import( "../components/notifications" ) );

// Affichage de la page.
export default async function Page( {
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
				<h3 className="text-lg font-medium">Notifications</h3>

				<p className="text-sm text-muted-foreground">
					Choisissez les notifications que vous souhaitez recevoir par
					courriel ou directement sur le site Internet.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de signalement d'un bogue */}
			<Notifications session={( await auth() ) as Session} />
		</>
	);
}