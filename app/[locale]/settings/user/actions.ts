//
// Actions du serveur pour les paramètres utilisateur.
//

"use server";

import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/user";
import { join } from "path";
import { auth } from "@/utilities/next-auth";
import { cookies } from "next/headers";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, readdir, rm, writeFile } from "fs/promises";

//
// Mise à jour des informations utilisateur.
//
export async function updateUser(
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
		username: formData.get( "username" ),
		email: formData.get( "email" ),
		password: formData.get( "password" ),
		language: formData.get( "language" ),
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

	// On met à jour après le nom d'utilisateur et l'adresse électronique
	//  de l'utilisateur dans la base de données.
	await prisma.user.update( {
		where: {
			id: session.user.id
		},
		data: {
			name: result.data.username,
			email: result.data.email,
			password: result.data.password
				? await bcrypt.hash( result.data.password, 13 )
				: undefined
		}
	} );

	// On modifie la langue sélectionnée par l'utilisateur dans les
	//  cookies de son navigateur.
	cookies().set( "NEXT_LOCALE", result.data.language );

	// On vérifie également si un avatar a été fourni.
	const avatar = result.data.avatar as File;

	if (
		avatar.size !== 0
		&& avatar.name !== "undefined"
		&& avatar.type !== "application/octet-stream"
	)
	{
		// Si c'est le cas, on récupère le tampon de l'avatar téléversé
		//   pour vérifier son type au travers des nombres magiques.
		const info = await fileTypeFromBuffer(
			new Uint8Array( await result.data.avatar.arrayBuffer() )
		);

		if ( !info )
		{
			// Si les informations de l'avatar ne sont pas disponibles,
			//  on indique que le type de fichier est incorrect ou qu'il
			//  contient des données textuelles.
			return {
				success: false,
				reason: "zod.errors.wrong_file_type"
			};
		}

		// On parcourt l'ensemble des types d'avatars acceptés pour
		//  vérifier si le type de l'avatar correspond à l'un d'entre eux.
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

		try
		{
			// On créé le dossier des avatar s'il n'existe pas.
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
		reason: "settings.user.success"
	};
}