//
// Route vers la page de paramétrage des informations utilisateur.
//

// Importation des dépendances.
import qrCode from "qrcode";
import { lazy } from "react";
import { redirect } from "next/navigation";
import { TOTP, Secret } from "otpauth";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "@/app/layout";

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
	const messages = await getTranslations();
	const session = await auth();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

	// Génération du code secret pour l'authentification à deux facteurs.
	const secret = new Secret();
	const meta = await generateMetadata();
	const otp = new TOTP( {
		label: session.user.email as string,
		secret,
		issuer: meta.title as string,
		digits: 6,
		period: 30,
		algorithm: "SHA256"
	} );

	// Affichage du rendu HTML de la page.
	return (
		<>
			{/* En-tête de la page */}
			<header>
				<h3 className="text-lg font-medium">
					{messages( "navigation.user_title" )}
				</h3>

				<p className="text-sm text-muted-foreground">
					{messages( "settings.user" )}
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