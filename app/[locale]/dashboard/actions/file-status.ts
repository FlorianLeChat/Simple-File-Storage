//
// Action de changement de statut d'un ou plusieurs fichiers.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";

export async function changeFileStatus( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return [];
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = z.object( {
		fileIds: z.array( z.string().uuid() ),
		status: z.enum( [ "private", "public" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileIds: formData.getAll( "fileId" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __filename, result }, "Invalid form data" );

		return [];
	}

	// On récupère et on met à jour le statut de tous les fichiers
	//  qui seront modifiés dans la base de données.
	const query = {
		where: {
			id: {
				in: result.data.fileIds
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
			],
			status: result.data.status === "private" ? "public" : undefined
		},
		data: {
			status: result.data.status
		}
	};

	const [ files ] = await prisma.$transaction( [
		prisma.file.findMany( {
			select: {
				id: true
			},
			where: query.where
		} ),

		prisma.file.updateMany( query )
	] );

	// On réinitialise également les partages des fichiers si ceux-ci
	//  deviennent publiquement accessibles.
	const identifiers = files.map( ( file ) => file.id );

	if ( result.data.status === "public" )
	{
		await prisma.share.deleteMany( {
			where: {
				fileId: {
					in: identifiers
				}
			}
		} );
	}

	// On retourne enfin la liste des identifiants des fichiers modifiés
	//  à la fin du traitement.
	logger.debug( { source: __filename, identifiers }, "File status changed" );

	return identifiers;
}