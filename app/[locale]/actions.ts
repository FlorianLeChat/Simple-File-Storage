//
// Actions générales du serveur pour les composants globaux.
//

"use server";

import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";

//
// Mise à jour de l'état de lecture des notifications.
//
export async function updateReadState()
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		// Si la session n'existe pas, on indique que l'utilisateur
		//  n'est pas connecté.
		return false;
	}

	// On supprime ensuite toutes les notifications de l'utilisateur.
	const notifications = await prisma.notification.deleteMany( {
		where: {
			userId: session.user.id
		}
	} );

	// On retourne enfin un message de succès si l'opération a réussi.
	logger.debug(
		{ source: __dirname, count: notifications.count },
		"Deleted all notifications"
	);

	return notifications.count > 0;
}