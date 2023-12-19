//
// Actions du serveur pour les paramètres du profil utilisateur.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/profile";
import { auth } from "@/utilities/next-auth";
import { promises as fileSystem } from "fs";

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
		// Si la session n'existe pas, on affiche un message d'erreur
		//  dans le formulaire (cela ne devrait jamais arriver).
		return {
			success: false,
			reason: "form.errors.invalid"
		};
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		avatar: formData.get( "avatar" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche un
		//  message d'erreur générique ou plus précis selon le cas.
		const reason = result.error.issues[ 0 ].message;

		return {
			success: false,
			reason: reason.startsWith( "zod.errors." )
				? reason
				: "form.errors.generic"
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
			// Si un fichier d'avatar a bien été fourni, on le met à jour
			//  dans le système de fichiers.
			const type = avatar.type.split( "/" )[ 1 ];

			const folderPath = "./public/avatars";
			const filePath = `${ folderPath }/${ session.user.id }.${ type }`;

			await fileSystem.mkdir( folderPath, { recursive: true } );
			await fileSystem.writeFile(
				filePath,
				new Uint8Array( await avatar.arrayBuffer() )
			);
		}
		catch ( error )
		{
			// Si une erreur survient lors de la mise à jour de l'avatar,
			//  on affiche un message d'erreur générique.
			return {
				success: false,
				reason: "form.errors.generic"
			};
		}
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.profile.success"
	};
}