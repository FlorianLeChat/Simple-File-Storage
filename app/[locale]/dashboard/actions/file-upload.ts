//
// Action de téléversement d'un ou plusieurs nouveaux fichiers.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { statSync } from "fs";
import { join, parse } from "path";
import { compressFile } from "@/utilities/sharp";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, readdir, writeFile } from "fs/promises";

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
		shorten: formData.get( "shorten" ) === "on",
		encryption: formData.get( "encryption" ) === "on",
		expiration: formData.get( "expiration" ),
		compression: formData.get( "compression" ) === "on"
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		const { message } = result.issues[ 0 ];

		logger.error( { source: __dirname, result }, "Invalid form data" );

		return {
			success: false,
			reason: message.startsWith( "custom." )
				? messages( `valibot.${ message.slice( 7 ) }` )
				: message
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
			{ source: __dirname, currentQuota, maxQuota },
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
						{ source: __dirname, file, info },
						"File type not accepted"
					);

					return [];
				}
			}

			// On effectue une éventuelle compression si le fichier n'a pas été
			//  chiffré avant le téléversement au serveur.
			const extension = info ? `.${ info.ext }` : parse( file.name ).ext;
			const compressed = result.output.compression && !result.output.encryption
				? await compressFile( buffer, extension.replace( ".", "" ) )
				: buffer;

			if ( result.output.compression )
			{
				logger.debug(
					{
						source: __dirname,
						file,
						before: buffer.length,
						after: compressed.length
					},
					"Compressed file"
				);
			}

			// On chiffre le fichier avec l'algorithme AES-256-GCM si celui-ci
			//  n'a pas été chiffré par le client avant le téléversement.
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

			const encrypted = result.output.encryption
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
				] );

			logger.debug(
				{ source: __dirname, file },
				`File encrypted ${ result.output.encryption ? "client" : "server" }-side`
			);

			// On génère une chaîne de hachage unique représentant les
			//  données du fichier.
			const digest = await crypto.subtle.digest( "SHA-256", encrypted );
			const hash = Array.from( new Uint8Array( digest ) )
				.map( ( byte ) => byte.toString( 16 ).padStart( 2, "0" ) )
				.join( "" );

			// On vérifie si un fichier existe déjà avec le même nom
			//  dans le dossier de l'utilisateur.
			const { name } = parse( file.name );
			const exists = await prisma.file.findFirst( {
				where: {
					name: name + extension,
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

			// On récupère l'identifiant unique du nouveau fichier ou du
			//  fichier existant avant de créer une nouvelle version en
			//  fonction des préférences de l'utilisateur.
			const expiration = result.output.expiration !== ""
				? new Date( result.output.expiration )
				: null;
			const status = preferences.public ? "public" : "private";
			const fileId = !exists
				? (
					await prisma.file.create( {
						data: {
							name: ( name + extension ).slice( 0, 128 ),
							userId: session.user.id,
							status,
							expiration
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

			// On raccourcit le lien d'accès au fichier si l'utilisateur
			//  a choisi de le faire. On utilise pour cela l'API de
			//  raccourcissement de liens via Raven Url Shortener.
			let slug;

			if ( result.output.shorten )
			{
				const headerStore = await headers();
				const protocol = headerStore.get( "x-forwarded-proto" ) ?? "https://";
				const host = headerStore.get( "x-forwarded-host" ) ?? headerStore.get( "origin" );
				const url = `${ protocol }${ host }/d/${ fileId }`;
				const shortenRequest = await fetch( "https://url.florian-dev.fr/api/v1/link", {
					method: "POST",
					body: JSON.stringify( { url } )
				} );

				const shortenResponse = ( await shortenRequest.json() ) as {
					slug?: string;
				};

				if ( !shortenRequest.ok )
				{
					// Gestion des erreurs du raccourcisseur.
					logger.error(
						{ source: __dirname, fileId, url, response: shortenResponse },
						"Failed to shorten file link"
					);
				}
				else
				{
					// Réponse du raccourcisseur et mise à jour du slug
					//  du fichier dans la base de données.
					logger.info(
						{ source: __dirname, fileId, url, response: shortenResponse },
						"File link shortened"
					);

					slug = shortenResponse.slug;

					await prisma.file.update( {
						where: {
							id: fileId
						},
						data: {
							slug: shortenResponse.slug
						}
					} );
				}
			}

			// Une fois la version créée, on ajoute une notification à
			//  tous les utilisateurs partagés avec le fichier pour les
			//  prévenir que quelqu'un a téléversé une nouvelle version.
			if ( exists )
			{
				await prisma.notification.createMany( {
					data: exists.shares
						.filter( ( share ) => share.user.notification.includes( "necessary" ) || share.user.notification.includes( "all" ) )
						.map( ( share ) => ( {
							title: 3,
							userId: share.userId,
							message: 3
						} ) )
				} );

				logger.debug(
					{ source: __dirname, file },
					"Created version notification"
				);
			}

			// Après la création de la notification, on créé le dossier de
			//  sauvegarde avant d'y écrire le fichier téléversé.
			const fileFolder = join( userFolder, fileId );

			await mkdir( fileFolder, { recursive: true } );
			await writeFile(
				join( fileFolder, `${ versionId }${ extension }` ),
				encrypted
			);

			revalidatePath( "/" );

			logger.info(
				{ source: __dirname, file, fileFolder, versionId },
				"File uploaded"
			);

			// Suite à un problème dans React, on doit convertir les
			//  fichiers sous format JSON pour pouvoir les envoyer
			//  à travers le réseau vers les composants clients.
			//  Source : https://github.com/vercel/next.js/issues/47447
			const path = `/d/${ fileId }${
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
				name,
				type: file.type,
				size: versions.reduce(
					( previous, current ) => previous + Number( current.size ),
					0
				),
				path,
				slug,
				owner: exists?.user ?? session.user,
				status: exists?.shares && exists?.shares.length > 0
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
				} ) ),
				expiration
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
				{ source: __dirname, currentQuota, maxQuota },
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
			success: isUser ? !quotaIsExceeded : true,
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
		logger.error( { source: __dirname, error }, "File upload failed" );

		Sentry.captureException( error );

		return {
			success: false,
			reason: messages( "form.infos.upload_failed" )
		};
	}
}