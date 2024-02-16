//
// Suppression des fichiers expirés dans le système de fichiers et dans la base de données.
//

// Importation des dépendances.
import { join } from "path";
import * as dotenv from "dotenv";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { PrismaClient } from "@prisma/client";

// Configuration des variables d'environnement.
dotenv.config( { path: join( process.cwd(), ".env.local" ), override: true } );

// Exécution de la fonction asynchrone.
const script = async () =>
{
	// Création d'une nouvelle instance de Prisma et récupération
	//  des fichiers expirés depuis la base de données.
	const prisma = new PrismaClient();
	const files = await prisma.file.findMany( {
		where: {
			expiration: {
				lte: new Date()
			}
		}
	} );

	// Suppression des fichiers expirés dans la base de données.
	await prisma.file.deleteMany( {
		where: {
			id: {
				in: files.map( ( file ) => file.id )
			}
		}
	} );

	// Création d'une promesse pour traiter chaque fichier.
	await Promise.all(
		files.map( async ( file ) =>
		{
			// Récupération du répertoire utilisateur.
			const userFolder = join( process.cwd(), "public/files", file.userId );

			if ( existsSync( userFolder ) )
			{
				// Récupération du chemin d'accès au fichier.
				const fileFolder = join( userFolder, file.id );

				if ( existsSync( fileFolder ) )
				{
					// Suppression du fichier dans le système de fichiers.
					await rm( fileFolder, { recursive: true, force: true } );
				}

				if ( ( await readdir( userFolder ) ).length === 0 )
				{
					// Suppression du répertoire utilisateur si celui-ci est vide.
					await rm( userFolder, { recursive: true, force: true } );
				}
			}
		} )
	);

	// Déconnexion de la base de données.
	prisma.$disconnect();
};

script();