//
// Action de mise à jour des paramètres du stockage utilisateur.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import { rm } from "fs/promises";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import * as Sentry from "@sentry/nextjs";
import { existsSync } from "fs";
import { join, parse } from "path";
import { getTranslations } from "next-intl/server";

export async function updateStorage(
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
	const validation = v.object( {
		public: v.boolean(),
		extension: v.boolean(),
		versions: v.boolean()
	} );

	const result = v.safeParse( validation, {
		public: formData.get( "public" ) === "on",
		extension: formData.get( "extension" ) === "on",
		versions: formData.get( "versions" ) === "on"
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		logger.error( { source: __filename, result }, "Invalid form data" );

		return {
			success: false,
			reason: messages( `zod.${ result.issues[ 0 ].type }` )
		};
	}

	// On créé ou on met à jour après les préférences de l'utilisateur dans la
	//  base de données.
	await prisma.preference.upsert( {
		where: {
			userId: session.user.id
		},
		update: {
			public: result.output.public,
			extension: result.output.extension,
			versions: result.output.versions
		},
		create: {
			userId: session.user.id,
			public: result.output.public,
			extension: result.output.extension,
			versions: result.output.versions
		}
	} );

	// On vérifie si l'utilisateur a désactivé le mécanisme de versionnement
	//  des fichiers et qu'il l'avait activé auparavant.
	if (
		!result.output.versions
		&& session.user.preferences.versions !== result.output.versions
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
				catch ( error )
				{
					// Si une erreur survient dans les opérations du système
					//  de fichiers, on l'envoie tout simplement à Sentry.
					logger.error(
						{ source: __filename, error },
						"Error deleting file versions"
					);

					Sentry.captureException( error );
				}
			} )
		);
	}

	// On retourne enfin un message de succès.
	logger.debug( { source: __filename, result }, "Storage preferences updated" );

	return {
		success: true,
		reason: messages( "form.infos.storage_updated" )
	};
}