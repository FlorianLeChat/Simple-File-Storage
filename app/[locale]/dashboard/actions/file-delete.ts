//
// Action de suppression d'un ou plusieurs fichiers.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import { join } from "path";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import * as Sentry from "@sentry/nextjs";
import { existsSync } from "fs";
import { rm, readdir } from "fs/promises";

export async function deleteFile( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return [];
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = v.object( {
		fileIds: v.array( v.pipe( v.string(), v.uuid() ) )
	} );

	// On tente alors de valider les données du formulaire.
	const result = v.safeParse( validation, {
		fileIds: formData.getAll( "fileId" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __filename, result }, "Invalid form data" );

		return [];
	}

	// On récupère avant de supprimer après les fichiers dans la base
	//  de données pour vérifier si l'opération a réussi.
	const query = {
		id: {
			in: result.output.fileIds
		},
		OR: [
			{
				userId: session.user.id
			},
			{
				shares: {
					some: {
						userId: session.user.id,
						status: "write"
					}
				}
			}
		]
	};

	const [ files ] = await prisma.$transaction( [
		prisma.file.findMany( {
			select: {
				id: true,
				userId: true
			},
			where: query
		} ),

		prisma.file.deleteMany( { where: query } )
	] );

	if ( files.length === 0 )
	{
		// Si aucun fichier n'a été trouvé dans la base de données,
		//  on retourne une valeur d'échec.
		logger.error( { source: __filename, query }, "No files found" );

		return [];
	}

	try
	{
		// On parcourt l'ensemble des fichiers à supprimer.
		await Promise.all(
			files.map( async ( file ) =>
			{
				// On supprime le fichier et le dossier associé dans le
				//  système de fichiers.
				const userFolder = join(
					process.cwd(),
					"public/files",
					file.userId
				);

				if ( existsSync( userFolder ) )
				{
					// On supprime le dossier où se trouve les versions du
					//  fichier.
					const fileFolder = join( userFolder, file.id );

					if ( existsSync( fileFolder ) )
					{
						await rm( fileFolder, { recursive: true, force: true } );
					}

					// On supprime de la même manière le dossier de l'utilisateur
					//  si celui-ci est vide après la suppression du fichier.
					if ( ( await readdir( userFolder ) ).length === 0 )
					{
						await rm( userFolder, { recursive: true, force: true } );
					}
				}
			} )
		);
	}
	catch ( error )
	{
		// Si une erreur s'est produite lors des opérations avec le
		//  système de fichiers, on l'envoie tout simplement à Sentry.
		logger.error( { source: __filename, error }, "File deletion error" );

		Sentry.captureException( error );
	}

	// On retourne enfin la liste des identifiants des fichiers supprimés
	//  à la fin du traitement.
	logger.debug( { source: __filename, files }, "Files deleted" );

	return files.map( ( file ) => file.id );
}