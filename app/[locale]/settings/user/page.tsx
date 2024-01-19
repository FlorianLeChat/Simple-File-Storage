//
// Route vers la page de paramétrage des informations utilisateur.
//

// Importation des dépendances.
import { lazy } from "react";
import { type Session } from "next-auth";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const User = lazy( () => import( "../components/user" ) );

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
				<h3 className="text-lg font-medium">Utilisateur</h3>

				<p className="text-sm text-muted-foreground">
					Contrôler la façon dont vous apparaissez sur le site.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification du profil utilisateur */}
			<User session={( await auth() ) as Session} />
		</>
	);
}