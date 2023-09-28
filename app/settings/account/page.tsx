//
// Route vers la page de paramétrage du compte utilisateur.
//

// Importation des dépendances.
import { lazy } from "react";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Account = lazy( () => import( "../components/account" ) );

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">Compte utilisateur</h3>

				<p className="text-sm text-muted-foreground">
					Mettez à jour les paramètres qui contrôlent votre compte.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification du compte utilisateur */}
			<Account />
		</>
	);
}