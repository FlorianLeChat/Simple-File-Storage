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
import { existsSync } from "fs";
import { join, parse } from "path";
import { getDirectorySize } from "@/utilities/file-system";
import { rm, mkdir, readdir, link, writeFile, copyFile } from "fs/promises";

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

	try
	{
		// On met à jour le statut du fichier dans la base de données
		//  avant de retourner une valeur de succès.
		await Promise.all(
			result.data.fileIds.map( async ( id ) =>
			{
				await prisma.file.updateMany( {
					where: {
						id,
						userId: session.user.id
					},
					data: {
						status: result.data.status
					}
				} );
			} )
		);

		return true;
	}
	catch
	{
		// En cas d'erreur lors de la transaction avec la base de données,
		//  on retourne enfin une valeur d'échec.
		return false;
	}
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

	// On parcourt l'ensemble des fichiers à renommer.
	await Promise.all(
		result.data.fileIds.map( async ( id ) =>
		{
			// On récupère après les données du fichier depuis
			//  la base de données.
			const file = await prisma.file.findUnique( {
				where: {
					id,
					userId: session.user.id
				}
			} );

			if ( !file )
			{
				return;
			}

			// On renomme le fichier dans la base de données avant de
			//  retourner une valeur de succès.
			await prisma.file.update( {
				where: {
					id,
					userId: session.user.id
				},
				data: {
					name: result.data.name + parse( file.name ).ext
				}
			} );
		} )
	);

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
		const userFolder = join( process.cwd(), "public/files", session.user.id );

		await mkdir( userFolder, { recursive: true } );

		// On récupère après le quota actuel et maximal de l'utilisateur.
		const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
		let currentQuota = await getDirectorySize( userFolder );

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
		const data = result.data.upload.map( async ( file ) =>
		{
			// On génère une chaîne de hachage unique représentant les
			//  données du fichier.
			const buffer = new Uint8Array( await file.arrayBuffer() );
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
					userId: user.id
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
			//  fichier existant avant de créer une nouvelle version.
			const fileId = !exists
				? (
					await prisma.file.create( {
						data: {
							name: file.name,
							userId: user.id,
							status: "private"
						}
					} )
				).id
				: exists.id;

			const versionId = (
				await prisma.version.create( {
					data: {
						hash: digest,
						size: `${ file.size }`,
						fileId
					}
				} )
			).id;

			// Une fois la version créée, on créé le dossier du fichier
			//  dans le système de fichiers.
			const fileFolder = join( userFolder, fileId );

			await mkdir( fileFolder, { recursive: true } );

			if ( duplication )
			{
				// Si une duplication a été détectée précédemment, on créé
				//  un lien symbolique vers le fichier dupliqué afin de
				//  réduire l'espace disque utilisé.
				await link(
					join(
						process.cwd(),
						"public/files",
						duplication.file.userId,
						duplication.fileId,
						duplication.id + parse( duplication.file.name ).ext
					),
					join( fileFolder, `${ versionId + parse( file.name ).ext }` )
				);
			}
			else
			{
				// Dans le cas contraire, on créé le fichier dans le système
				//  de fichiers comme d'habitude.
				await writeFile(
					join( fileFolder, `${ versionId + parse( file.name ).ext }` ),
					buffer
				);
			}

			// Suite à un problème dans React, on doit convertir les
			//  fichiers sous format JSON pour pouvoir les envoyer
			//  à travers le réseau vers les composants clients.
			//  Source : https://github.com/vercel/next.js/issues/47447
			const path = `${ process.env.__NEXT_ROUTER_BASEPATH }/d/${ fileId }`;
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
				status: exists?.status ?? "private",
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
		return false;
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
		return false;
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
			versions: true
		}
	} );

	if ( !file || file.versions[ 0 ].id === result.data.versionId )
	{
		return false;
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
		return false;
	}

	// On tente après de récupérer la version à restaurer.
	const targetVersion = file.versions.find(
		( version ) => version.id === result.data.versionId
	);

	if ( !targetVersion )
	{
		return false;
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

		copyFile(
			join( userFolder, targetVersion.id + extension ),
			join( userFolder, newVersion.id + extension )
		);

		// On retourne une valeur de succès à la fin du traitement.
		return true;
	}
	catch
	{
		// Si une erreur s'est produite lors de l'opération avec le
		//  système de fichiers, on retourne enfin une valeur d'échec.
		return false;
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

	try
	{
		// On parcourt l'ensemble des fichiers à supprimer.
		const userFolder = join( process.cwd(), "public/files", session.user.id );

		await Promise.all(
			result.data.fileIds.map( async ( id ) =>
			{
				// On supprime après le fichier dans la base de données.
				const file = await prisma.file.delete( {
					where: {
						id,
						userId: session.user.id
					}
				} );

				// On supprime le fichier et le dossier associé dans le
				//  système de fichiers.
				if ( existsSync( userFolder ) )
				{
					// On supprime le dossier où se trouve les versions du
					//  fichier.
					const fileFolder = join( userFolder, file.id );

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