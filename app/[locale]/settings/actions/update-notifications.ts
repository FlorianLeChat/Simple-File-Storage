//
// Action de mise à jour des notifications utilisateur.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/notifications";
import { auth } from "@/utilities/next-auth";
import { getTranslations } from "next-intl/server";

export async function updateNotifications(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();
	const messages = await getTranslations();

	if ( !session )
	{
		// Si la session n'existe pas, on indique que l'utilisateur
		//  n'est pas connecté.
		return {
			success: false,
			reason: messages( "authjs.errors.SessionRequired" )
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
			reason: messages( `zod.${ result.error.issues[ 0 ].code }` )
		};
	}

	// On met à jour après le niveau de notifications de l'utilisateur dans la
	//  base de données.
	const notification =
		result.data.push && result.data.level !== "off"
			? `${ result.data.level }+mail`
			: result.data.level;

	await prisma.user.update( {
		where: {
			email: session.user.email as string
		},
		data: {
			notification
		}
	} );

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: messages( "form.infos.notifications_updated" )
	};
}