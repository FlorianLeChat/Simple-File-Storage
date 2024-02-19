//
// Suppression des notifications créées il y a plus de 30 jours.
//

// Importation des dépendances.
import { join } from "path";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Configuration des variables d'environnement.
dotenv.config( { path: join( process.cwd(), ".env.local" ), override: true } );

// Nombre maximal de notifications que l'utilisateur peut avoir.
const MAX_NOTIFICATIONS = 50;

// Durée avant la suppression des notifications (en millisecondes).
const TIME_BEFORE_DELETION = 30 * 24 * 60 * 60 * 1000;

// Exécution de la fonction asynchrone.
const script = async () =>
{
	// Récupération des utilisateurs.
	const prisma = new PrismaClient();
	const users = await prisma.user.findMany( {
		include: {
			_count: {
				select: {
					notifications: true
				}
			}
		}
	} );

	await Promise.all(
		users.map( async ( user ) =>
		{
			// Vérification du nombre de notifications.
			if ( user._count.notifications > MAX_NOTIFICATIONS )
			{
				// Suppression des notifications datant de plus de 30 jours.
				await prisma.notification.deleteMany( {
					where: {
						userId: user.id,
						createdAt: {
							lte: new Date( Date.now() - TIME_BEFORE_DELETION )
						}
					}
				} );
			}
		} )
	);

	// Déconnexion de la base de données.
	prisma.$disconnect();
};

script();