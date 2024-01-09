//
// Actions du serveur pour le formulaire d'inscription et de connexion.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { join, parse } from "path";
import { existsSync, statSync } from "fs";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";

//
// Changement du statut d'un fichier.
//
export async function changeFileStatus( formData: FormData )
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
		uuid: z.string().uuid(),
		status: z.enum( [ "private", "public" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		uuid: formData.get( "uuid" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		return false;
	}

	try
	{
		// On met à jour le statut du fichier dans la base de données
		//  avant de retourner une valeur de succès.
		await prisma.file.update( {
			where: {
				fileId: result.data.uuid,
				userId: session.user.id
			},
			data: {
				status: result.data.status
			}
		} );

		return true;
	}
	catch
	{
		// En cas d'erreur lors de la transaction avec la base de données,
		//  on retourne enfin une valeur d'échec.
		return false;
	}
}

//
// Téléversement d'un nouveau fichier.
//
export async function uploadFiles(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		// Si la session n'existe pas, on indique que l'utilisateur
		//  n'est pas connecté.
		return {
			success: false,
			reason: "form.errors.unauthenticated"
		};
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		upload: formData.getAll( "upload" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		const { code, message } = result.error.issues[ 0 ];

		return {
			success: false,
			reason: `zod.errors.${ code === "custom" ? message : code }`
		};
	}

	// On vérifie si un utilisateur existe avec l'adresse électronique
	//  de la session.
	const user = await prisma.user.findUnique( {
		where: {
			email: session.user.email as string
		}
	} );

	if ( !user )
	{
		// Si l'utilisateur n'existe pas, on affiche un message d'erreur
		//  dans le formulaire.
		return {
			success: false,
			reason: "form.errors.unknown_user"
		};
	}

	try
	{
		// On créé le dossier de l'utilisateur si celui-ci n'existe pas.
		const userFolder = join( process.cwd(), "public/files", session.user.id );

		await mkdir( userFolder, { recursive: true } );

		// On récupère après le quota actuel et maximal de l'utilisateur.
		const currentFiles = await readdir( userFolder );
		const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
		let currentQuota = currentFiles.reduce(
			( previous, current ) => previous + statSync( join( userFolder, current ) ).size,
			0
		);

		// On filtre la liste des fichiers à téléverser pour ne garder que
		//  ceux qui ne dépassent pas le quota de l'utilisateur.
		result.data.upload = result.data.upload.filter( ( file ) =>
		{
			currentQuota += file.size;

			return currentQuota <= maxQuota;
		} );

		// On téléverse chaque fichier dans le système de fichiers.
		const data = result.data.upload.map( async ( file, index ) =>
		{
			// On insère le nom du fichier et son statut dans la base de
			//  données afin de générer un identifiant unique.
			const identifier = (
				await prisma.file.create( {
					data: {
						name: file.name,
						userId: user.id,
						status: "private"
					}
				} )
			).fileId;

			// On écrit alors le fichier dans le système de fichiers
			//  avec l'identifiant unique généré précédemment.
			await writeFile(
				join( userFolder, `${ identifier + parse( file.name ).ext }` ),
				new Uint8Array( await file.arrayBuffer() )
			);

			// Suite à un problème dans React, on doit convertir les
			//  fichiers sous format JSON pour pouvoir les envoyer
			//  à travers le réseau vers les composants clients.
			//  Source : https://github.com/vercel/next.js/issues/47447
			return JSON.stringify( {
				id: currentFiles.length + index,
				uuid: identifier,
				name: parse( file.name ).name,
				size: file.size,
				type: file.type,
				path: `${ process.env.__NEXT_ROUTER_BASEPATH }/d/${ identifier }`
			} );
		} );

		// On retourne un message de succès ou d'erreur si le quota de
		//  l'utilisateur a été dépassé en compagnie de la liste des
		//  fichiers téléversés avec succès.
		return {
			success: currentQuota <= maxQuota,
			reason:
				currentQuota > maxQuota
					? "form.errors.quota_exceeded"
					: "form.info.upload_success",
			data: await Promise.all( data )
		};
	}
	catch ( error )
	{
		// Si une erreur survient lors de la mise à jour de l'avatar,
		//  on affiche enfin un message d'erreur générique.
		return {
			success: false,
			reason: "form.errors.file_system"
		};
	}
}

//
// Suppression irréversible d'un fichier.
//
export async function deleteFile( formData: FormData )
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
		uuid: z.string().uuid()
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		uuid: formData.get( "uuid" )
	} );

	if ( !result.success )
	{
		return false;
	}

	try
	{
		// On supprime après le fichier dans la base de données.
		const file = await prisma.file.delete( {
			where: {
				fileId: result.data.uuid,
				userId: session.user.id
			}
		} );

		// On vérifie si le fichier existe dans le système de fichiers.
		const filePath = join(
			process.cwd(),
			"public/files",
			session.user.id,
			file.fileId + parse( file.name ).ext
		);

		if ( !existsSync( filePath ) )
		{
			return false;
		}

		// On supprime le fichier avant de retourner une valeur de succès.
		await unlink( filePath );

		return true;
	}
	catch
	{
		// Si une erreur s'est produite lors de la transaction avec la
		//  base de données ou avec le système de fichiers, on retourne
		//  enfin une valeur d'échec.
		return false;
	}
}