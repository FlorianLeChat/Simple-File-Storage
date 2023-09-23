//
// Route vers la page de l'apparence du site.
//

// Importation des dépendances.
import { lazy } from "react";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Layout = lazy( () => import( "../components/layout" ) );

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<div className="space-y-6">
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">Apparence</h3>

				<p className="text-sm text-muted-foreground">
					Personnaliser l&lsquo;apparence du site. Basculer
					automatiquement du thème clair au thème sombre et changer la
					police de caractère.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification de l'apparence */}
			<Layout />
		</div>
	);
}