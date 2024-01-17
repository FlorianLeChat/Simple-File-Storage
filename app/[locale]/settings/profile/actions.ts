//
// Actions du serveur pour les paramètres du profil utilisateur.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/profile";
import { join } from "path";
import { auth } from "@/utilities/next-auth";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, readdir, rm, writeFile } from "fs/promises";

//
// Mise à jour des informations du profil utilisateur.
//
export async function updateProfile(
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
		email: formData.get( "email" ),
		avatar: formData.get( "avatar" )
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

	// On récupère le tampon du fichier téléversé pour vérifier son type
	//  au travers des nombres magiques.
	const info = await fileTypeFromBuffer(
		new Uint8Array( await result.data.avatar.arrayBuffer() )
	);

	if ( !info )
	{
		// Si les informations du fichier ne sont pas disponibles, on
		//  indique que le type de fichier est incorrect ou qu'il contient
		//  des données textuelles.
		return {
			success: false,
			reason: "zod.errors.wrong_file_type"
		};
	}

	// On parcourt l'ensemble des types d'avatars acceptés pour vérifier
	//  si le type du fichier téléversé correspond à l'un d'entre eux.
	const types = process.env.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES?.split( "," );
	const state = types?.some( ( type ) =>
	{
		const acceptedType = type.trim().slice( 0, -1 );
		return info.mime.startsWith( acceptedType );
	} );

	if ( !state )
	{
		// Si le type du fichier ne correspond à aucun type d'avatar
		//  accepté, on indique que le type de fichier est incorrect.
		return {
			success: false,
			reason: "zod.errors.wrong_file_type"
		};
	}

	// On vérifie après si l'adresse électronique fournie est différente
	//  de celle enregistrée dans la base de données.
	if ( session.user.email !== result.data.email )
	{
		// Dans ce cas, on la met à jour dans la base de données.
		await prisma.user.update( {
			where: {
				email: session.user.email as string
			},
			data: {
				email: result.data.email
			}
		} );
	}

	// On vérifie également si un avatar a été fourni.
	const avatar = result.data.avatar as File;

	if (
		avatar.size !== 0
		&& avatar.name !== "undefined"
		&& avatar.type !== "application/octet-stream"
	)
	{
		try
		{
			// Si un fichier d'avatar a bien été fourni, on créé le
			//  dossier d'enregistrement des avatars s'il n'existe pas.
			const folderPath = join( process.cwd(), "public/avatars" );

			await mkdir( folderPath, { recursive: true } );

			// On supprime l'ancien avatar de l'utilisateur s'il existe
			//  dans le système de fichiers.
			const avatars = await readdir( folderPath );
			const savedAvatar = avatars.find( ( file ) => file.includes( session.user.id ) );

			if ( savedAvatar )
			{
				await rm( join( folderPath, savedAvatar ), { force: true } );
			}

			// On écrit alors le nouvel avatar dans le système de fichiers.
			await writeFile(
				join( folderPath, `${ session.user.id }.${ info.ext }` ),
				new Uint8Array( await avatar.arrayBuffer() )
			);
		}
		catch
		{
			// Si une erreur survient lors de la mise à jour de l'avatar,
			//  on affiche un message d'erreur générique.
			return {
				success: false,
				reason: "form.errors.file_system"
			};
		}
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.profile.success"
	};
}