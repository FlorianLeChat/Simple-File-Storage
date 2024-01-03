//
// Actions du serveur pour le formulaire d'inscription et de connexion.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import mime from "mime";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { redirect } from "next/navigation";
import { join, parse } from "path";
import { mkdir, readdir, writeFile } from "fs/promises";
import { existsSync, statSync } from "fs";

//
// Récupération du quota de l'utilisateur.
//
export async function getUserQuota()
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		// Si la session n'existe pas, on redirige l'utilisateur vers
		//  la page d'accueil.
		return redirect( "/" );
	}

	try
	{
		// On créé le dossier de stockage si celui-ci n'existe pas.
		const folderPath = join( process.cwd(), "public/storage" );

		await mkdir( folderPath, { recursive: true } );

		// On vérifie ensuite si le dossier de l'utilisateur existe.
		const userFolder = join( folderPath, session.user.id );

		if ( !existsSync( userFolder ) )
		{
			// Si ce n'est pas le cas, le quota est de 0.
			return {
				success: true,
				value: 0
			};
		}

		// Dans le cas contraire, on calcule la somme des tailles des
		//  fichiers de l'utilisateur.
		return {
			success: true,
			value: ( await readdir( userFolder ) ).reduce(
				( previous, current ) => previous + statSync( join( userFolder, current ) ).size,
				0
			)
		};
	}
	catch ( error )
	{
		// On affiche enfin une erreur en cas d'erreur avec le système
		//  de fichiers.
		return {
			success: false,
			value: 0
		};
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
		// Si la session n'existe pas, on redirige l'utilisateur vers
		//  la page d'accueil.
		return redirect( "/" );
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		upload: formData.getAll( "upload" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		return {
			success: false,
			reason: `zod.errors.${ result.error.issues[ 0 ].code }`
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
		const userFolder = join(
			process.cwd(),
			"public/storage",
			session.user.id
		);

		await mkdir( userFolder, { recursive: true } );

		// On récupère après le quota actuel et maximal de l'utilisateur.
		const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
		let currentQuota = ( await getUserQuota() ).value;

		// On vérifie si le quota de l'utilisateur n'est pas dépassé pour
		//  chaque fichier à téléverser.
		result.data.upload.every( async ( file ) =>
		{
			// Si le quota de l'utilisateur est dépassé, on indique
			//  que le téléversement a été interrompu.
			currentQuota += file.size;

			if ( currentQuota > maxQuota )
			{
				return false;
			}

			// On insère le nom du fichier et son statut dans la base de
			//  données afin de générer un identifiant unique.
			const identifier = (
				await prisma.file.create( {
					data: {
						name: parse( file.name ).name,
						userId: user.id,
						status: "public"
					}
				} )
			).fileId;

			// On écrit alors le fichier dans le système de fichiers
			//  avec l'identifiant unique généré précédemment.
			await writeFile(
				join(
					userFolder,
					`${ identifier }.${ mime.getExtension( file.type ) }`
				),
				new Uint8Array( await file.arrayBuffer() )
			);

			// On indique par ailleurs que le téléversement s'est bien
			//  passé.
			return true;
		} );

		if ( currentQuota > maxQuota )
		{
			// Si un dépassement de quota a été détecté, on affiche un
			//  message d'erreur dans le formulaire.
			return {
				success: false,
				reason: "form.errors.quota_exceeded"
			};
		}
	}
	catch ( error )
	{
		// Si une erreur survient lors de la mise à jour de l'avatar,
		//  on affiche un message d'erreur générique.
		return {
			success: false,
			reason: "form.errors.file_system"
		};
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "form.info.upload_success"
	};
}