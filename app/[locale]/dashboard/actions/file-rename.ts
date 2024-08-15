//
// Action de renommage d'un ou plusieurs fichiers.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { parse } from "path";
import { logger } from "@/utilities/pino";

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
	//  Note : les validations Valibot du nom doivent correspondre à
	//   celles utilisées lors du téléversement de fichiers.
	const validation = v.object( {
		fileIds: v.array( v.pipe( v.string(), v.uuid() ) ),
		name: v.pipe( v.string(), v.minLength( 1 ), v.maxLength( 100 ) )
	} );

	// On tente alors de valider les données du formulaire.
	const result = v.safeParse( validation, {
		fileIds: formData.getAll( "fileId" ),
		name: formData.get( "name" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __filename, result }, "Invalid form data" );

		return [];
	}

	// On récupère après les données du premier fichier dans
	//  la base de données qui doit être renommé.
	const first = await prisma.file.findFirst( {
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
			]
		}
	} );

	if ( !first )
	{
		logger.error( { source: __filename, result }, "Invalid file data" );

		return [];
	}

	// On récupère et on renomme alors les fichiers dans la base
	//  de données.
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
			]
		},
		data: {
			name: result.output.name + parse( first.name ).ext
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
	logger.debug( { source: __filename, files }, "Files renamed" );

	return files.map( ( file ) => file.id );
}