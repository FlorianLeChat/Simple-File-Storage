//
// Action de mise à jour des permissions d'un utilisateur dans la liste des partages d'un fichier.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";

export async function updateSharedUser( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return false;
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = v.object( {
		fileId: v.pipe( v.string(), v.uuid() ),
		userId: v.pipe( v.string(), v.uuid() ),
		status: v.picklist( [ "read", "write" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = v.safeParse( validation, {
		fileId: formData.get( "fileId" ),
		userId: formData.get( "userId" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __dirname, result }, "Invalid form data" );

		return false;
	}

	// On met à jour également le statut de partage du fichier dans
	//  la base de données.
	const share = await prisma.share.updateMany( {
		where: {
			file: {
				id: result.output.fileId,
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
			},
			userId: result.output.userId
		},
		data: {
			status: result.output.status
		}
	} );

	// On retourne enfin une valeur de succès à la fin du traitement.
	logger.debug( { source: __dirname, share }, "Shared user updated" );

	return share.count > 0;
}