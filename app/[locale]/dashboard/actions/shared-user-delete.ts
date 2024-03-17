//
// Action de suppression d'un utilisateur de la liste des partages d'un fichier.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";

export async function deleteSharedUser( formData: FormData )
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
		fileId: z.array( z.string().uuid() ),
		userId: z.string().uuid().optional()
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileId: formData.getAll( "fileId" ),
		userId: formData.get( "userId" ) ?? undefined
	} );

	if ( !result.success )
	{
		return false;
	}

	// On supprime également le partage dans la base de données
	//  avant de vérifier si l'opération a réussi.
	const query = {
		where: {
			file: {
				id: {
					in: result.data.fileId
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
			},
			userId: result.data.userId
		}
	};

	const [ shares ] = await prisma.$transaction( [
		prisma.share.findMany( {
			select: {
				user: {
					select: {
						notification: true
					}
				},
				userId: true
			},
			where: query.where
		} ),

		prisma.share.deleteMany( query )
	] );

	// On ajoute une notification pour prévenir tous les utilisateurs
	//  qui ont été retirés que quelqu'un a retiré un fichier partagé
	//  avec eux.
	await prisma.notification.createMany( {
		data: shares
			.filter(
				( share ) => share.user.notification.includes( "necessary" )
					|| share.user.notification.includes( "all" )
			)
			.map( ( share ) => ( {
				title: 3,
				userId: share.userId,
				message: 3
			} ) )
	} );

	// On retourne enfin une valeur de succès à la fin du traitement.
	return shares.length > 0;
}