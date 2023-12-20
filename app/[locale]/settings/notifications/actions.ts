//
// Actions du serveur pour les paramètres des notifications.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/notifications";
import { auth } from "@/utilities/next-auth";
import { redirect } from "next/navigation";

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
		// Si la session n'existe pas, on redirige l'utilisateur vers
		//  la page d'accueil.
		return redirect( "/" );
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		push: formData.get( "push" ) === "on",
		level: formData.get( "level" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche un
		//  message d'erreur générique ou plus précis selon le cas.
		const reason = result.error.issues[ 0 ].message;

		return {
			success: false,
			reason: reason.startsWith( "zod.errors." )
				? reason
				: "form.errors.generic"
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