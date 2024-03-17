//
// Action d'ajout d'un utilisateur à la liste des partages d'un fichier.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";

export async function addSharedUser( formData: FormData )
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
		userId: z.string().uuid()
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileId: formData.get( "fileId" ),
		userId: formData.get( "userId" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On vérifie également si le fichier existe bien dans la base de
	//  données et si l'utilisateur a le droit de le partager.
	const file = await prisma.file.findFirst( {
		where: {
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
		}
	} );

	if ( !file )
	{
		return false;
	}

	// On vérifie par la suite si l'utilisateur existe bien dans la base
	//  de données et si celui-ci n'est pas déjà en partage avec le fichier.
	const user = await prisma.user.findUnique( {
		where: {
			id: result.data.userId,
			AND: {
				NOT: {
					OR: [
						{
							files: {
								some: {
									id: file.id
								}
							}
						},
						{
							shares: {
								some: {
									fileId: file.id
								}
							}
						}
					]
				}
			}
		},
		include: {
			shares: true,
			preferences: true
		}
	} );

	if ( !user )
	{
		return false;
	}

	// On ajoute après l'utilisateur à la liste des partages
	//  du fichier.
	await prisma.share.create( {
		data: {
			fileId: file.id,
			userId: user.id,
			status: "read"
		}
	} );

	// On ajoute une notification pour prévenir l'utilisateur que
	//  quelqu'un a partagé un fichier avec lui.
	if (
		user.notification.includes( "necessary" )
		|| user.notification.includes( "all" )
	)
	{
		await prisma.notification.create( {
			data: {
				title: 2,
				userId: user.id,
				message: 2
			}
		} );
	}

	// On retourne enfin une valeur de succès à la fin du traitement.
	return true;
}