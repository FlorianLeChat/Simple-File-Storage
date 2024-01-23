//
// Actions du serveur pour le formulaire d'inscription et de connexion.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import { z } from "zod";
import crypto from "crypto";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/file-upload";
import { auth } from "@/utilities/next-auth";
import { join, parse } from "path";
import { fileTypeFromBuffer } from "file-type";
import { existsSync, statSync } from "fs";
import { rm, mkdir, readdir, link, writeFile } from "fs/promises";

//
// Changement du statut d'un ou plusieurs fichiers.
//
export async function changeFileStatus( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return false;
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = z.object( {
		fileIds: z.array( z.string().uuid() ),
		status: z.enum( [ "private", "public" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileIds: formData.getAll( "fileId" ),
		status: formData.get( "status" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On met à jour le statut du fichier dans la base de données
	//  avant de retourner une valeur de succès.
	await prisma.file.updateMany( {
		where: {
			id: {
				in: result.data.fileIds
			},
			userId: session.user.id
		},
		data: {
			status: result.data.status
		}
	} );

	return true;
}

//
// Renommage du nom d'un ou plusieurs fichiers.
//
export async function renameFile( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return false;
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	//  Note : les validations Zod du nom doivent correspondre à
	//   celles utilisées lors du téléversement de fichiers.
	const validation = z.object( {
		fileIds: z.array( z.string().uuid() ),
		name: z.string().min( 1 ).max( 100 )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileIds: formData.getAll( "fileId" ),
		name: formData.get( "name" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On récupère après les données du premier fichier dans
	//  la base de données qui doit être renommé.
	const file = await prisma.file.findFirst( {
		where: {
			id: {
				in: result.data.fileIds
			},
			userId: session.user.id
		}
	} );

	if ( !file )
	{
		return false;
	}

	// On renomme alors les fichiers dans la base de données
	//  avant de retourner une valeur de succès.
	await prisma.file.updateMany( {
		where: {
			id: {
				in: result.data.fileIds
			},
			userId: session.user.id
		},
		data: {
			name: result.data.name + parse( file.name ).ext
		}
	} );

	// On retourne enfin une valeur de succès à la fin du traitement.
	return true;
}

//
// Téléversement d'un ou plusieurs nouveaux fichiers.
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
		if ( session.user.role !== "admin" )
		{
			result.data.upload = result.data.upload.filter( ( file ) =>
			{
				currentQuota += file.size;

				return currentQuota <= maxQuota;
			} );
		}

		// On téléverse chaque fichier dans le système de fichiers.
		const { preferences } = session.user;
		const types = process.env.NEXT_PUBLIC_ACCEPTED_FILE_TYPES?.split( "," );
		const data = result.data.upload.map( async ( file ) =>
		{
			// On tente de récupérer le tampon du fichier téléversé pour vérifier
			//  son type au travers des nombres magiques.
			const buffer = new Uint8Array( await file.arrayBuffer() );
			const info = await fileTypeFromBuffer( buffer );

			if ( info )
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
					return [];
				}
			}

			// On génère une chaîne de hachage unique représentant les
			//  données du fichier.
			const hash = crypto.createHash( "sha256" );
			hash.update( buffer );

			// On détermine si ce fichier semble être une duplication d'une
			//  autre version d'un fichier déjà téléversé par un autre
			//  utilisateur.
			const digest = hash.digest( "hex" );
			const duplication = await prisma.version.findFirst( {
				where: {
					hash: digest
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
					versions: true
				}
			} );

			// On vérifie alors si le fichier dupliqué est bien le même
			//  que le fichier existant pour éviter de créer une nouvelle
			//  version d'un fichier déjà existant.
			if ( exists && duplication && exists?.id === duplication?.fileId )
			{
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
							name: file.name,
							userId: session.user.id,
							status
						}
					} )
				).id
				: exists.id;

			const versionId = (
				await prisma.version.upsert( {
					where: {
						id:
							exists && !preferences.versions
								? exists.versions[ 0 ].id
								: ""
					},
					update: {
						createdAt: new Date()
					},
					create: {
						hash: digest,
						size: `${ file.size }`,
						fileId
					}
				} )
			).id;

			// Une fois la version créée, on créé le dossier du fichier
			//  dans le système de fichiers.
			const fileFolder = join( userFolder, fileId );
			const extension = `.${ info?.ext }` ?? parse( file.name ).ext;

			await mkdir( fileFolder, { recursive: true } );

			if ( duplication )
			{
				// Si une duplication a été détectée précédemment, on supprime
				//  le fichier existant et on créé un lien symbolique vers le
				//  fichier dupliqué afin de réduire l'espace disque utilisé.
				const filePath = join( fileFolder, `${ versionId + extension }` );

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
				// Dans le cas contraire, on génère un vecteur d'initialisation
				//  puis on chiffre le fichier avec l'algorithme AES-256-CTR
				//  avant de l'écrire dans le système de fichiers.
				const iv = crypto.randomBytes( 16 );
				const cipher = crypto.createCipheriv(
					"aes-256-ctr",
					Buffer.from( process.env.AUTH_SECRET ?? "", "base64" ),
					iv
				);

				await writeFile(
					join( fileFolder, `${ `${ versionId }${ extension }` }` ),
					Buffer.concat( [ iv, cipher.update( buffer ), cipher.final() ] )
				);
			}

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
				status: exists?.status ?? status,
				versions: versions.map( ( version ) => ( {
					uuid: version.id,
					size: Number( version.size ),
					date: version.createdAt,
					path: `${ path }?v=${ version.id }`
				} ) )
			} );
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
			data: ( await Promise.all( data ) ).flat()
		};
	}
	catch
	{
		// Si une erreur survient lors du téléversement des fichiers,
		//  on affiche enfin un message d'erreur générique.
		return {
			success: false,
			reason: "form.errors.upload_failed"
		};
	}
}

//
// Restauration d'une version précédente d'un fichier.
//
export async function restoreVersion( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return "";
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = z.object( {
		fileId: z.string().uuid(),
		versionId: z.string().uuid()
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileId: formData.get( "fileId" ),
		versionId: formData.get( "versionId" )
	} );

	if ( !result.success )
	{
		return "";
	}

	// On récupère toutes les versions du fichier depuis la base de
	//  données pour vérifier si la version à restaurer existe bien
	//  et si elle est différente de la version actuelle.
	const file = await prisma.file.findUnique( {
		where: {
			id: result.data.fileId,
			userId: session.user.id
		},
		include: {
			versions: {
				orderBy: {
					createdAt: "desc"
				}
			}
		}
	} );

	if ( !file || file.versions[ 0 ].id === result.data.versionId )
	{
		return "";
	}

	// On vérifie si le dossier de l'utilisateur existe bien.
	const userFolder = join(
		process.cwd(),
		"public/files",
		session.user.id,
		result.data.fileId
	);

	if ( !existsSync( userFolder ) )
	{
		return "";
	}

	// On tente après de récupérer la version à restaurer.
	const targetVersion = file.versions.find(
		( version ) => version.id === result.data.versionId
	);

	if ( !targetVersion )
	{
		return "";
	}

	// On créé également une nouvelle version à partir de la version
	//  à restaurer.
	const newVersion = await prisma.version.create( {
		data: {
			hash: targetVersion.hash,
			size: targetVersion.size,
			fileId: result.data.fileId
		}
	} );

	try
	{
		// On copie le fichier de la version à restaurer vers la nouvelle
		//  version dans le système de fichiers.
		const extension = parse( file.name ).ext;

		link(
			join( userFolder, targetVersion.id + extension ),
			join( userFolder, newVersion.id + extension )
		);

		// On retourne l'identifiant de la nouvelle version à restaurer
		//  à la fin du traitement.
		return newVersion.id;
	}
	catch
	{
		// Si une erreur s'est produite lors de l'opération avec le
		//  système de fichiers, on retourne enfin une valeur vide.
		return "";
	}
}

//
// Suppression irréversible d'un ou plusieurs fichiers.
//
export async function deleteFile( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		return false;
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = z.object( {
		fileIds: z.array( z.string().uuid() )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		fileIds: formData.getAll( "fileId" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On supprime après les fichiers dans la base de données.
	await prisma.file.deleteMany( {
		where: {
			id: {
				in: result.data.fileIds
			},
			userId: session.user.id
		}
	} );

	try
	{
		// On parcourt l'ensemble des fichiers à supprimer.
		const userFolder = join( process.cwd(), "public/files", session.user.id );

		await Promise.all(
			result.data.fileIds.map( async ( id ) =>
			{
				// On supprime le fichier et le dossier associé dans le
				//  système de fichiers.
				if ( existsSync( userFolder ) )
				{
					// On supprime le dossier où se trouve les versions du
					//  fichier.
					const fileFolder = join( userFolder, id );

					if ( existsSync( fileFolder ) )
					{
						await rm( fileFolder, { recursive: true, force: true } );
					}

					// On supprime de la même manière le dossier de l'utilisateur
					//  si celui-ci est vide après la suppression du fichier.
					if ( ( await readdir( userFolder ) ).length === 0 )
					{
						await rm( userFolder, { recursive: true, force: true } );
					}
				}
			} )
		);

		// On retourne une valeur de succès à la fin du traitement.
		return true;
	}
	catch
	{
		// Si une erreur s'est produite lors des opérations avec le
		//  système de fichiers, on retourne enfin une valeur d'échec.
		return false;
	}
}