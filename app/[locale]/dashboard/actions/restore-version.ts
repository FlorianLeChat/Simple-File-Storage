//
// Action de restauration d'une version précédente d'un fichier.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import * as Sentry from "@sentry/nextjs";
import { join, parse } from "path";
import { readdir, link } from "fs/promises";
import { existsSync, statSync } from "fs";

//
// Restauration d'une version précédente d'un fichier.
//
export async function restoreVersion( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur ainsi
	//  que ses préférences.
	const session = await auth();

	if ( !session?.user.preferences.versions )
	{
		return "";
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = v.object( {
		fileId: v.pipe( v.string(), v.uuid() ),
		versionId: v.pipe( v.string(), v.uuid() )
	} );

	// On tente alors de valider les données du formulaire.
	const result = v.safeParse( validation, {
		fileId: formData.get( "fileId" ),
		versionId: formData.get( "versionId" )
	} );

	if ( !result.success )
	{
		logger.error( { source: __dirname, result }, "Invalid form data" );

		return "";
	}

	// On récupère toutes les versions du fichier depuis la base de
	//  données pour vérifier si la version à restaurer existe bien
	//  et si elle est différente de la version actuelle.
	const file = await prisma.file.findUnique( {
		where: {
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
		include: {
			shares: {
				include: {
					user: true
				}
			},
			versions: {
				orderBy: {
					createdAt: "desc"
				}
			}
		}
	} );

	if ( !file || file.versions[ 0 ].id === result.output.versionId )
	{
		logger.error( { source: __dirname, result }, "Invalid file data" );

		return "";
	}

	// On vérifie si le dossier de l'utilisateur et celui du fichier
	//  existent bien dans le système de fichiers.
	const userFolder = join( process.cwd(), "public/files", file.userId );
	const fileFolder = join( userFolder, result.output.fileId );

	if ( !existsSync( userFolder ) || !existsSync( fileFolder ) )
	{
		logger.error( { source: __dirname, result }, "Invalid file data" );

		return "";
	}

	// On tente après de récupérer la version à restaurer.
	const targetVersion = file.versions.find(
		( version ) => version.id === result.output.versionId
	);

	if ( !targetVersion )
	{
		logger.error( { source: __dirname, result }, "Invalid version data" );

		return "";
	}

	// On vérifie si le quota de l'utilisateur ne sera pas dépassé
	//  après la restauration de cette version.
	//  Note : cela ne concerne pas les administrateurs.
	if ( session.user.role !== "admin" )
	{
		try
		{
			const files = await readdir( userFolder, { recursive: true } );
			const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
			const nextQuota = files.reduce( ( previous, current ) =>
			{
				const { size } = statSync( join( userFolder, current ) );
				return previous + size;
			}, Number( targetVersion.size ) );

			if ( nextQuota > maxQuota )
			{
				logger.error(
					{ source: __dirname, nextQuota, maxQuota },
					"Quota exceeded"
				);

				return "";
			}
		}
		catch ( error )
		{
			// Si une erreur s'est produite lors de l'opération avec le
			//  système de fichiers, on l'envoie à Sentry avant de retourner
			//  enfin une valeur vide.
			logger.error( { source: __dirname, error }, "Error checking quota" );

			Sentry.captureException( error );

			return "";
		}
	}

	// On créé également une nouvelle version à partir de la version
	//  à restaurer.
	const newVersion = await prisma.version.create( {
		data: {
			hash: targetVersion.hash,
			size: targetVersion.size,
			fileId: result.output.fileId
		}
	} );

	// On ajoute une notification à tous les utilisateurs partagés
	//  avec le fichier pour les prévenir que quelqu'un a restauré
	//  une version précédente.
	await prisma.notification.createMany( {
		data: file.shares
			.filter( ( share ) => share.user.notification.includes( "necessary" ) || share.user.notification.includes( "all" ) )
			.map( ( share ) => ( {
				title: 3,
				userId: share.userId,
				message: 3
			} ) )
	} );

	try
	{
		// On copie le fichier de la version à restaurer vers la nouvelle
		//  version dans le système de fichiers.
		const extension = parse( file.name ).ext;

		link(
			join( fileFolder, targetVersion.id + extension ),
			join( fileFolder, newVersion.id + extension )
		);

		// On retourne l'identifiant de la nouvelle version à restaurer
		//  à la fin du traitement.
		logger.debug( { source: __dirname, newVersion }, "Version restored" );

		return newVersion.id;
	}
	catch ( error )
	{
		// Si une erreur s'est produite lors de l'opération avec le
		//  système de fichiers, on l'envoie à Sentry avant de retourner
		//  enfin une valeur vide.
		logger.error( { source: __dirname, error }, "Error restoring version" );

		Sentry.captureException( error );

		return "";
	}
}