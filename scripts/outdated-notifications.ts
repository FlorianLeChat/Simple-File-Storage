//
// Suppression des notifications créées il y a plus de 30 jours.
//

// Importation des dépendances.
import { join } from "path";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Configuration des variables d'environnement.
dotenv.config( { path: join( process.cwd(), ".env.local" ), override: true } );

// Exécution de la fonction asynchrone.
const script = async () =>
{
	// Suppression des notifications créées il y a plus de 30 jours.
	const prisma = new PrismaClient();

	await prisma.notification.findMany( {
		where: {
			createdAt: {
				lte: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 )
			}
		}
	} );

	// Déconnexion de la base de données.
	prisma.$disconnect();
};

script();