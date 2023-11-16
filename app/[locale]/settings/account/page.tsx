//
// Route vers la page de paramétrage du compte utilisateur.
//

// Importation des dépendances.
import { lazy } from "react";
import { unstable_setRequestLocale } from "next-intl/server";
import { type Session, getServerSession } from "next-auth";

// Importation des fonctions utilitaires.
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

const Account = lazy( () => import( "../components/account" ) );

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
				<h3 className="text-lg font-medium">Compte utilisateur</h3>

				<p className="text-sm text-muted-foreground">
					Mettez à jour les paramètres qui contrôlent votre compte.
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification du compte utilisateur */}
			<Account
				session={( await getServerSession( authOptions ) ) as Session}
			/>
		</>
	);
}