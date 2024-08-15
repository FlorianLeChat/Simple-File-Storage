//
// Action de téléversement d'un ou plusieurs nouveaux fichiers.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import * as Sentry from "@sentry/nextjs";
import { statSync } from "fs";
import { join, parse } from "path";
import { compressFile } from "@/utilities/sharp";
import { getTranslations } from "next-intl/server";
import { fileTypeFromBuffer } from "file-type";
import { rm, mkdir, readdir, link, writeFile } from "fs/promises";

export async function uploadFiles(
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
	const isUser = session.user.role !== "admin";
	const result = v.safeParse( schema, {
		upload: formData.getAll( "upload" ),
		encryption: formData.get( "encryption" ) === "on",
		expiration: formData.get( "expiration" ),
		compression: formData.get( "compression" ) === "on"
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		const { type, message } = result.issues[ 0 ];

		logger.error( { source: __filename, result }, "Invalid form data" );

		return {
			success: false,
			reason: messages( `zod.${ type === "custom" ? message : type }` )
		};
	}

	try
	{
		// On créé le dossier de l'utilisateur si celui-ci n'existe pas.
		const userFolder = join( process.cwd(), "public/files", session.user.id );

		await mkdir( userFolder, { recursive: true } );

		// On récupère après le quota actuel et maximal de l'utilisateur.
		const files = await readdir( userFolder, { recursive: true } );
		const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
		let currentQuota = files.reduce( ( previous, current ) =>
		{
			const { size } = statSync( join( userFolder, current ) );
			return previous + size;
		}, 0 );

		// On filtre la liste des fichiers à téléverser pour ne garder que
		//  ceux qui ne dépassent pas le quota de l'utilisateur.
		//  Note : cela ne concerne pas les administrateurs.
		if ( isUser )
		{
			result.output.upload = result.output.upload.filter( ( file ) =>
			{
				currentQuota += file.size;

				return currentQuota <= maxQuota;
			} );
		}

		logger.debug(
			{ source: __filename, currentQuota, maxQuota },
			"Current and maximum quota"
		);

		// On téléverse chaque fichier dans le système de fichiers.
		const { preferences } = session.user;
		const types = process.env.NEXT_PUBLIC_ACCEPTED_FILE_TYPES?.split( "," );
		const data = result.output.upload.map( async ( file ) =>
		{
			// On tente de récupérer le tampon du fichier téléversé pour vérifier
			//  son type au travers des nombres magiques.
			//  Note : si le fichier est chiffré, on ignore les 16 premiers octets.
			const buffer = new Uint8Array( await file.arrayBuffer() );
			const info = await fileTypeFromBuffer( buffer );

			if ( info && isUser )
			{
				// Si les informations du fichier sont disponibles, on vérifie
				//  si le type du fichier correspond à l'un des types de fichiers
				//  acceptés.
				const state = types?.some( ( type ) =>
				{
					const acceptedType = type.trim().slice( 0, -1 );
					return info.mime.startsWith( acceptedType );
				} );

				if ( !state )
				{
					// Si le type du fichier ne correspond à aucun type de fichier
					//  accepté, on retourne une liste vide.
					logger.error(
						{ source: __filename, result },
						"File type not accepted"
					);

					return [];
				}
			}

			// On génère une chaîne de hachage unique représentant les
			//  données du fichier.
			const digest = await crypto.subtle.digest( "SHA-256", buffer );
			const hash = Array.from( new Uint8Array( digest ) )
				.map( ( byte ) => byte.toString( 16 ).padStart( 2, "0" ) )
				.join( "" );

			// On détermine si ce fichier semble être une duplication d'une
			//  autre version d'un fichier déjà téléversé par un autre
			//  utilisateur.
			const duplication = await prisma.version.findFirst( {
				where: {
					hash
				},
				include: {
					file: true
				}
			} );

			// On vérifie si un fichier existe déjà avec le même nom
			//  dans le dossier de l'utilisateur.
			const exists = await prisma.file.findFirst( {
				where: {
					name: file.name,
					userId: session.user.id
				},
				include: {
					user: true,
					shares: {
						include: {
							user: true
						}
					},
					versions: true
				}
			} );

			// On vérifie alors si le fichier dupliqué est bien le même
			//  que le fichier existant pour éviter de créer une nouvelle
			//  version d'un fichier déjà existant.
			if ( exists && duplication && exists?.id === duplication?.fileId )
			{
				logger.error(
					{ source: __filename, result },
					"File already exists"
				);

				return [];
			}

			// On récupère l'identifiant unique du nouveau fichier ou du
			//  fichier existant avant de créer une nouvelle version en
			//  fonction des préférences de l'utilisateur.
			const status = preferences.public ? "public" : "private";
			const fileId = !exists
				? (
					await prisma.file.create( {
						data: {
							name: file.name.slice( 0, 128 ),
							userId: session.user.id,
							status,
							expiration:
								result.output.expiration !== ""
									? new Date( result.output.expiration )
									: null
						}
					} )
				).id
				: exists.id;

			const versionId = (
				await prisma.version.upsert( {
					where: {
						id: exists && !preferences.versions
							? exists.versions[ 0 ].id
							: ""
					},
					update: {
						createdAt: new Date()
					},
					create: {
						hash,
						size: `${ file.size }`,
						fileId,
						encrypted: result.output.encryption
					}
				} )
			).id;

			// Une fois la version créée, on ajoute une notification à
			//  tous les utilisateurs partagés avec le fichier pour les
			//  prévenir que quelqu'un a téléversé une nouvelle version.
			if ( exists )
			{
				await prisma.notification.createMany( {
					data: exists.shares
						.filter(
							( share ) => share.user.notification.includes( "necessary" )
								|| share.user.notification.includes( "all" )
						)
						.map( ( share ) => ( {
							title: 3,
							userId: share.userId,
							message: 3
						} ) )
				} );

				logger.debug(
					{ source: __filename },
					"Created version notification"
				);
			}

			// Après la création de la notification, on créé le dossier du fichier
			//  dans le système de fichiers.
			const extension = info ? `.${ info.ext }` : parse( file.name ).ext;
			const fileFolder = join( userFolder, fileId );

			await mkdir( fileFolder, { recursive: true } );

			if ( duplication )
			{
				// Si une duplication a été détectée précédemment, on supprime
				//  le fichier existant et on créé un lien symbolique vers le
				//  fichier dupliqué afin de réduire l'espace disque utilisé.
				const filePath = join( fileFolder, `${ versionId + extension }` );

				logger.debug(
					{ source: __filename, filePath, duplication },
					"File duplication detected"
				);

				await rm( filePath, { force: true } );
				await link(
					join(
						process.cwd(),
						"public/files",
						duplication.file.userId,
						duplication.fileId,
						duplication.id + parse( duplication.file.name ).ext
					),
					filePath
				);
			}
			else
			{
				// Dans le cas contraire, on chiffre le fichier avec l'algorithme
				//  AES-256-GCM avant d'effectuer une éventuelle compression
				//  pour enfin l'écrire dans le système de fichiers.
				//  Note : si l'utilisateur a demandé un chiffrement renforcé,
				//   le fichier a déjà été chiffré par le client.
				const iv = crypto.getRandomValues( new Uint8Array( 16 ) );
				const cipher = await crypto.subtle.importKey(
					"raw",
					Buffer.from( process.env.AUTH_SECRET ?? "", "base64" ),
					{
						name: "AES-GCM",
						length: 256
					},
					true,
					[ "encrypt", "decrypt" ]
				);
				const compressed = result.output.compression && !result.output.encryption
					? await compressFile( buffer, extension.replace( ".", "" ) )
					: buffer;

				if ( result.output.compression )
				{
					// Mise à jour de la taille de la version après compression.
					logger.debug(
						{
							source: __filename,
							versionId,
							size: compressed.length
						},
						"Compressed file"
					);

					await prisma.version.update( {
						where: {
							id: versionId
						},
						data: {
							size: `${ compressed.length }`
						}
					} );
				}

				await writeFile(
					join( fileFolder, `${ versionId }${ extension }` ),
					result.output.encryption
						? compressed
						: Buffer.concat( [
							iv,
							new Uint8Array(
								await crypto.subtle.encrypt(
									{
										iv,
										name: "AES-GCM"
									},
									cipher,
									compressed
								)
							)
						] )
				);
			}

			logger.debug(
				{ source: __filename, fileFolder, versionId },
				"File uploaded"
			);

			// Suite à un problème dans React, on doit convertir les
			//  fichiers sous format JSON pour pouvoir les envoyer
			//  à travers le réseau vers les composants clients.
			//  Source : https://github.com/vercel/next.js/issues/47447
			const path = `${ process.env.__NEXT_ROUTER_BASEPATH }/d/${ fileId }${
				preferences.extension ? extension : ""
			}`;
			const versions = await prisma.version.findMany( {
				where: {
					fileId
				},
				orderBy: {
					createdAt: "desc"
				}
			} );

			return JSON.stringify( {
				uuid: fileId,
				name: parse( file.name ).name,
				type: file.type,
				size: versions.reduce(
					( previous, current ) => previous + Number( current.size ),
					0
				),
				path,
				owner: exists?.user ?? session.user,
				status:
					exists?.shares && exists?.shares.length > 0
						? "shared"
						: ( exists?.status ?? status ),
				shares:
					exists?.shares.map( ( share ) => ( {
						user: {
							uuid: share.userId,
							name: share.user.name,
							email: share.user.email,
							image: share.user.image
						},
						status: share.status
					} ) ) ?? [],
				versions: versions.map( ( version ) => ( {
					uuid: version.id,
					size: Number( version.size ),
					date: version.createdAt,
					path: `${ path }?v=${ version.id }`,
					encrypted: version.encrypted
				} ) )
			} );
		} );

		// On ajoute une notification à l'utilisateur si le quota de
		//  celui-ci est proche d'être dépassé ou s'il est dépassé.
		//  Note : cela ne concerne pas les administrateurs.
		const quotaIsNear = currentQuota > maxQuota * 0.9;
		const quotaIsExceeded = currentQuota > maxQuota;

		if ( isUser && ( quotaIsNear || quotaIsExceeded ) )
		{
			logger.warn(
				{ source: __filename, currentQuota, maxQuota },
				"User quota exceeded"
			);

			await prisma.notification.create( {
				data: {
					title: quotaIsExceeded ? 6 : 5,
					userId: session.user.id,
					message: quotaIsExceeded ? 6 : 5
				}
			} );
		}

		// On retourne un message de succès ou d'erreur si le quota de
		//  l'utilisateur a été dépassé en compagnie de la liste des
		//  fichiers téléversés avec succès.
		return {
			success: currentQuota <= maxQuota,
			reason: isUser && quotaIsExceeded
				? messages( "form.errors.quota_exceeded" )
				: messages( "form.infos.upload_success" ),
			data: ( await Promise.all( data ) ).flat()
		};
	}
	catch ( error )
	{
		// Si une erreur survient lors du téléversement des fichiers,
		//  on l'envoie à Sentry et on retourne un message d'erreur.
		logger.error( { source: __filename, error }, "File upload failed" );

		Sentry.captureException( error );

		return {
			success: false,
			reason: messages( "form.infos.upload_failed" )
		};
	}
}