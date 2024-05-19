//
// Action de déconnexion d'un compte utilisateur.
//

"use server";

import { logger } from "@/utilities/pino";
import { signOut } from "@/utilities/next-auth";

export async function signOutAccount()
{
	// On tente de déconnecter l'utilisateur de son compte utilisateur
	//  avant de rediriger celui-ci vers la page d'accueil.
	logger.debug( { source: __filename }, "Sign out" );

	await signOut( {
		redirectTo: "/"
	} );
}