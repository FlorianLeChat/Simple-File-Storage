//
// Route vers la page de paramétrage du stockage.
//

// Importation des dépendances.
import { lazy } from "react";
import { type Session } from "next-auth";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Storage = lazy( () => import( "../components/storage" ) );

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
				<h3 className="text-lg font-medium">Stockage</h3>

				<p className="text-sm text-muted-foreground">
					Vous voulez contrôler davantage le comportement des fichiers
					lorsqu&lsquo;ils sont téléversés sur le site ? Vous êtes au
					bon endroit !
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de gestion de la confidentialité */}
			<Storage session={( await auth() ) as Session} />
		</>
	);
}