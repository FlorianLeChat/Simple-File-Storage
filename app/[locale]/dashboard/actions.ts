//
// Actions du serveur pour le formulaire d'inscription et de connexion.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { statSync } from "fs";
import { join, parse } from "path";
import { mkdir, readdir, writeFile } from "fs/promises";

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
		result.data.upload.forEach( async ( file ) =>
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
			data: result.data.upload.map( ( file, index ) => JSON.stringify( {
				// Suite à un problème dans React, on doit convertir les
				//  fichiers sous format JSON pour pouvoir les envoyer
				//  à travers le réseau vers les composants clients.
				//  Source : https://github.com/vercel/next.js/issues/47447
				id: currentFiles.length + index,
				name: parse( file.name ).name,
				size: file.size,
				type: file.type
			} ) )
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