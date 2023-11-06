//
// Route vers la page de l'apparence du site.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Layout = lazy( () => import( "../components/layout" ) );

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
		</>
	);
}