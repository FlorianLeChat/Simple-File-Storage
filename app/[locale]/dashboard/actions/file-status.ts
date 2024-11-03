//
// Action de changement de statut d'un ou plusieurs fichiers.
//

"use server";

import * as v from "valibot";
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
	const validation = v.object( {
		fileIds: v.array( v.pipe( v.string(), v.uuid() ) ),
		status: v.picklist( [ "private", "public" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = v.safeParse( validation, {
		fileIds: formData.getAll( "fileId" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __dirname, result }, "Invalid form data" );

		return [];
	}

	// On récupère et on met à jour le statut de tous les fichiers
	//  qui seront modifiés dans la base de données.
	const query = {
		where: {
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
			],
			status: result.output.status === "private" ? "public" : undefined
		},
		data: {
			status: result.output.status
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

	if ( result.output.status === "public" )
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
	logger.debug( { source: __dirname, identifiers }, "File status changed" );

	return identifiers;
}