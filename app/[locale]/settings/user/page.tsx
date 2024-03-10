//
// Route vers la page de paramétrage des informations utilisateur.
//

// Importation des dépendances.
import qrCode from "qrcode";
import { lazy } from "react";
import { TOTP, Secret } from "otpauth";
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

	// Déclaration des constantes.
	const session = ( await auth() ) as Session;
	const secret = new Secret();
	const otp = new TOTP( {
		label: session.user.email as string,
		secret,
		issuer: "Simple File Storage",
		digits: 6,
		period: 30,
		algorithm: "SHA256"
	} );

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">Utilisateur</h3>

				<p className="text-sm text-muted-foreground">
					Vous voulez montrez qui vous êtes ? Modifier votre nom
					d&lsquo;utilisateur ? Changer votre mot de passe ? Vous êtes
					au bon endroit !
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Formulaire de modification du profil utilisateur */}
			<User
				image={await qrCode.toDataURL( otp.toString() )}
				secret={secret.base32}
				session={session}
			/>
		</>
	);
}