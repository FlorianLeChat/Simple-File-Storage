//
// Action de renommage d'un ou plusieurs fichiers.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { parse } from "path";

export async function renameFile( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return [];
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	//  Note : les validations Zod du nom doivent correspondre à
	//   celles utilisées lors du téléversement de fichiers.
	const validation = z.object( {
		fileIds: z.array( z.string().uuid() ),
		name: z.string().min( 1 ).max( 100 )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileIds: formData.getAll( "fileId" ),
		name: formData.get( "name" )
	} );

	if ( !result.success )
	{
		return [];
	}

	// On récupère après les données du premier fichier dans
	//  la base de données qui doit être renommé.
	const first = await prisma.file.findFirst( {
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
			]
		}
	} );

	if ( !first )
	{
		return [];
	}

	// On récupère et on renomme alors les fichiers dans la base
	//  de données.
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
			]
		},
		data: {
			name: result.data.name + parse( first.name ).ext
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

	// On retourne enfin la liste des identifiants des fichiers renommés
	//  à la fin du traitement.
	return files.map( ( file ) => file.id );
}