//
// Actions du serveur pour les paramètres d'apparence.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/layout";
import { auth } from "@/utilities/next-auth";

//
// Mise à jour des informations utilisateur.
//
export async function updateLayout(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		// Si la session n'existe pas, on indique que l'utilisateur
		//  n'est pas connecté.
		return {
			success: false,
			reason: "form.errors.unauthenticated"
		};
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		font: formData.get( "font" ),
		color: formData.get( "color" ),
		theme: formData.get( "theme" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		return {
			success: false,
			reason: `zod.errors.${ result.error.issues[ 0 ].code }`
		};
	}

	// On créé ou on met à jour après les préférences de l'utilisateur dans la
	//  base de données.
	await prisma.preference.upsert( {
		where: {
			userId: session.user.id
		},
		update: {
			font: result.data.font,
			color: result.data.color,
			theme: result.data.theme
		},
		create: {
			userId: session.user.id,
			font: result.data.font,
			color: result.data.color,
			theme: result.data.theme
		}
	} );

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.layout.success"
	};
}