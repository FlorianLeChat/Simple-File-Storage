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
import { mkdir, stat, symlink, unlink, writeFile } from "fs/promises";

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
		uuid: z.array( z.string().uuid() ),
		status: z.enum( [ "private", "public" ] )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		uuid: formData.getAll( "uuid" ),
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
			result.data.uuid.map( async ( uuid ) =>
			{
				await prisma.file.updateMany( {
					where: {
						id: uuid,
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
		uuid: z.array( z.string().uuid() ),
		name: z.string().min( 1 ).max( 100 )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		uuid: formData.getAll( "uuid" ),
		name: formData.get( "name" )
	} );

	if ( !result.success )
	{
		return false;
	}

	try
	{
		// On parcourt l'ensemble des fichiers à renommer.
		await Promise.all(
			result.data.uuid.map( async ( uuid ) =>
			{
				// On récupère après les données du fichier depuis
				//  la base de données.
				const file = await prisma.file.findUnique( {
					where: {
						id: uuid,
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
						id: uuid,
						userId: session.user.id
					},
					data: {
						name: result.data.name + parse( file.name ).ext
					}
				} );
			} )
		);

		// On retourne une valeur de succès à la fin du traitement.
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
		const userStorage = join(
			process.cwd(),
			"public/files",
			session.user.id
		);

		await mkdir( userStorage, { recursive: true } );

		// On récupère après le quota actuel et maximal de l'utilisateur.
		const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA );
		let currentQuota = ( await stat( userStorage ) ).size;

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

			// Une fois la version créée, on créé le dossier de l'objet
			//  dans le système de fichiers.
			const objectFolder = join( userStorage, fileId );

			await mkdir( objectFolder, { recursive: true } );

			if ( duplication )
			{
				// Si une duplication a été détectée précédemment, on créé
				//  un lien symbolique vers le fichier dupliqué afin de
				//  réduire l'espace disque utilisé.
				await symlink(
					join(
						process.cwd(),
						"public/files",
						duplication.file.userId,
						duplication.fileId,
						duplication.id + parse( duplication.file.name ).ext
					),
					join( objectFolder, `${ versionId + parse( file.name ).ext }` )
				);
			}
			else
			{
				// Dans le cas contraire, on créé le fichier dans le système
				//  de fichiers comme d'habitude.
				await writeFile(
					join( objectFolder, `${ versionId + parse( file.name ).ext }` ),
					buffer
				);
			}

			// Suite à un problème dans React, on doit convertir les
			//  fichiers sous format JSON pour pouvoir les envoyer
			//  à travers le réseau vers les composants clients.
			//  Source : https://github.com/vercel/next.js/issues/47447
			return JSON.stringify( {
				uuid: fileId,
				name: parse( file.name ).name,
				size: file.size,
				type: file.type,
				path: `${ process.env.__NEXT_ROUTER_BASEPATH }/d/${ fileId }`,
				versions: (
					await prisma.version.findMany( {
						where: {
							fileId
						},
						orderBy: {
							createdAt: "asc"
						}
					} )
				).map( ( version ) => ( {
					uuid: version.id,
					size: version.size,
					date: version.createdAt.toLocaleString()
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
	catch ( error )
	{
		// Si une erreur survient lors de la mise à jour de l'avatar,
		//  on affiche enfin un message d'erreur générique.
		return {
			success: false,
			reason: "form.errors.file_system"
		};
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
		uuid: z.array( z.string().uuid() )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		uuid: formData.getAll( "uuid" )
	} );

	if ( !result.success )
	{
		return false;
	}

	try
	{
		// On parcourt l'ensemble des fichiers à supprimer.
		await Promise.all(
			result.data.uuid.map( async ( uuid ) =>
			{
				// On supprime après le fichier dans la base de données.
				const file = await prisma.file.delete( {
					where: {
						id: uuid,
						userId: session.user.id
					}
				} );

				// On vérifie si le fichier existe dans le système de fichiers.
				const filePath = join(
					process.cwd(),
					"public/files",
					session.user.id,
					file.id + parse( file.name ).ext
				);

				// On supprime le fichier (s'il existe) dans le système de
				//  fichiers.
				if ( existsSync( filePath ) )
				{
					await unlink( filePath );
				}
			} )
		);

		// On retourne une valeur de succès à la fin du traitement.
		return true;
	}
	catch
	{
		// Si une erreur s'est produite lors de la transaction avec la
		//  base de données ou avec le système de fichiers, on retourne
		//  enfin une valeur d'échec.
		return false;
	}
}