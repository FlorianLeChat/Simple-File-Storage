//
// Actions du serveur pour les paramètres des notifications.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/notifications";
import { auth } from "@/utilities/next-auth";

//
// Mise à jour des notifications.
//
export async function updateNotifications(
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
		push: formData.get( "push" ) === "on",
		level: formData.get( "level" )
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

	// On vérifie après si le niveau de notifications fourni est différent
	//  de celui enregistré dans la base de données.
	const notifications =
		result.data.push && result.data.level !== "off"
			? `${ result.data.level }+mail`
			: result.data.level;

	if ( session.user.notifications !== notifications )
	{
		// Dans ce cas, on le met à jour dans la base de données.
		await prisma.user.update( {
			where: {
				email: session.user.email as string
			},
			data: {
				notifications
			}
		} );
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.notifications.success"
	};
}