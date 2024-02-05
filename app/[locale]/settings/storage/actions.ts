//
// Actions du serveur pour les paramètres du stockage.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { rm } from "fs/promises";
import { auth } from "@/utilities/next-auth";
import { existsSync } from "fs";
import { join, parse } from "path";

//
// Mise à jour des paramètres de stockage.
//
export async function updateStorage(
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
	const validation = z.object( {
		public: z.boolean(),
		extension: z.boolean(),
		versions: z.boolean()
	} );

	const result = validation.safeParse( {
		public: formData.get( "public" ) === "on",
		extension: formData.get( "extension" ) === "on",
		versions: formData.get( "versions" ) === "on"
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

	// On met à jour après les préférences de l'utilisateur dans la base de
	//  données.
	await prisma.preference.update( {
		where: {
			userId: session.user.id
		},
		data: {
			public: result.data.public,
			extension: result.data.extension,
			versions: result.data.versions
		}
	} );

	// On vérifie si l'utilisateur a désactivé le mécanisme de versionnement
	//  des fichiers et qu'il l'avait activé auparavant.
	if (
		!result.data.versions
		&& session.user.preferences.versions !== result.data.versions
	)
	{
		// Si c'est le cas, on doit enclencher une suppression des anciennes
		//  versions des fichiers de l'utilisateur dans la base de données.
		const files = await prisma.file.findMany( {
			where: {
				userId: session.user.id
			},
			select: {
				id: true,
				name: true,
				versions: {
					select: {
						id: true
					}
				}
			}
		} );

		await Promise.all(
			files.map( async ( file ) =>
			{
				// Pour chaque fichier trouvé, on supprime alors toutes les
				//  versions sauf la dernière qui correspond à la version
				//  actuelle du fichier.
				const versions = file.versions.map( ( version ) => version.id );
				versions.pop();

				await prisma.version.deleteMany( {
					where: {
						id: {
							in: versions
						}
					}
				} );

				// On vérifie si le dossier de l'utilisateur existe toujours
				//  sur le système de fichiers.
				const userFolder = join(
					process.cwd(),
					"public/files",
					session.user.id
				);

				if ( !existsSync( userFolder ) )
				{
					return;
				}

				// Si c'est le cas, on parcourt toutes les anciennes versions
				//  du fichier et on les supprime.
				const extension = parse( file.name ).ext;
				const fileFolder = join( userFolder, file.id );

				try
				{
					await Promise.all(
						versions.map( async ( version ) =>
						{
							await rm( join( fileFolder, version + extension ), {
								force: true,
								recursive: true
							} );
						} )
					);
				}
				catch
				{
					// Si une erreur survient dans les opérations du système
					//  de fichiers, ce n'est pas très important car les
					//  changements auront déjà été effectués dans la base de
					//  données.
				}
			} )
		);
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.storage.success"
	};
}