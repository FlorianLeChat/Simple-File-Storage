//
// Action de mise à jour des permissions d'un utilisateur dans la liste des partages d'un fichier.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";

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
	const validation = z.object( {
		fileId: z.string().uuid(),
		userId: z.string().uuid(),
		status: z.enum( [ "read", "write" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileId: formData.get( "fileId" ),
		userId: formData.get( "userId" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On met à jour également le statut de partage du fichier dans
	//  la base de données.
	const share = await prisma.share.updateMany( {
		where: {
			file: {
				id: result.data.fileId,
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
			userId: result.data.userId
		},
		data: {
			status: result.data.status
		}
	} );

	// On retourne enfin une valeur de succès à la fin du traitement.
	return share.count > 0;
}