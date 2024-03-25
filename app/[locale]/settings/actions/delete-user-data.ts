//
// Action de suppression des données personnelles.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { join } from "path";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { auth, signOut } from "@/utilities/next-auth";
import { getTranslations } from "next-intl/server";

export async function deleteUserData(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();
	const messages = await getTranslations();

	if ( !session )
	{
		// Si la session n'existe pas, on indique que l'utilisateur
		//  n'est pas connecté.
		return {
			success: false,
			reason: messages( "authjs.errors.SessionRequired" )
		};
	}

	// On tente ensuite de valider les données du formulaire.
	const validation = z.object( {
		files: z.boolean(),
		account: z.boolean()
	} );

	const result = validation.safeParse( {
		files: formData.get( "files" ) === "on",
		account: formData.get( "account" ) === "on"
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		return {
			success: false,
			reason: messages( `zod.${ result.error.issues[ 0 ].code }` )
		};
	}

	// On vérifie après que l'utilisateur a demandé la suppression de
	//  son compte utilisateur et/ou de ses fichiers.
	const userFolder = join( process.cwd(), "public/files", session.user.id );

	if ( result.data.account )
	{
		try
		{
			// Si l'utilisateur a demandé la suppression de son compte,
			//  on supprime tous ses fichiers depuis le système de fichiers.
			await rm( userFolder, {
				recursive: true,
				force: true
			} );

			// On supprime par la même occasion son avatar (s'il existe).
			const folderPath = join( process.cwd(), "public/avatars" );

			if ( existsSync( folderPath ) )
			{
				const avatars = await readdir( folderPath );
				const avatar = avatars.find( ( file ) => file.includes( session.user.id ) );

				if ( avatar )
				{
					await rm( join( folderPath, avatar ), { force: true } );
				}
			}
		}
		finally
		{
			// On demande la déconnexion de l'utilisateur de toutes les
			//  sessions enregistrées.
			await signOut( {
				redirect: false
			} );

			// On supprime également l'utilisateur de la base de données.
			//  Note : la suppression de cette donnée entraîne la suppression
			//   en cascade de toutes les données liées à l'utilisateur.
			await prisma.user.delete( {
				where: {
					id: session.user.id
				}
			} );
		}
	}
	else if ( result.data.files )
	{
		try
		{
			// Si l'utilisateur a demandé la suppression de ses fichiers,
			//  on supprime son dossier depuis le système de fichiers.
			await rm( userFolder, {
				recursive: true,
				force: true
			} );
		}
		finally
		{
			// On supprime également les fichiers de l'utilisateur de la
			//  base de données.
			//  Note : la suppression de ces données entraîne la suppression
			//   en cascade de toutes les données annexes liées aux fichiers.
			await prisma.file.deleteMany( {
				where: {
					userId: session.user.id
				}
			} );
		}
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: messages( "form.infos.data_purged" )
	};
}