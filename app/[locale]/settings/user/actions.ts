//
// Actions du serveur pour les paramètres utilisateur.
//

"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/user";
import { join } from "path";
import { TOTP } from "otpauth";
import { auth } from "@/utilities/next-auth";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
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
		otp: formData.get( "otp" ),
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

	// On met à jour après le nom d'utilisateur, l'adresse électronique et
	//  le mot de passe de l'utilisateur dans la base de données.
	//  Note : si l'utilisateur s'est connecté avec un fournisseur
	//   d'authentification tiers, on supprime certaines informations
	//   pour éviter les modifications non autorisées.
	await prisma.user.update( {
		where: {
			id: session.user.id
		},
		data: {
			name: result.data.username,
			email: !session.user.oauth ? result.data.email : undefined,
			password:
				!session.user.oauth && result.data.password
					? await bcrypt.hash( result.data.password, 15 )
					: undefined
		}
	} );

	// On ajoute une notification pour prévenir l'utilisateur que son
	//  mot de passe a été modifié récemment.
	if ( result.data.password && !session.user.oauth )
	{
		await prisma.notification.create( {
			data: {
				title: 1,
				userId: session.user.id,
				message: 1
			}
		} );
	}

	// On vérifie si l'utilisateur tente de désactiver la double
	//  authentification grâce à son code de secours ou au code
	//  de validation généré par l'application d'authentification.
	if ( result.data.otp && session.user.otp )
	{
		// Code de secours enregistré dans la base de données.
		const data = await prisma.otp.findUnique( {
			where: {
				userId: session.user.id
			},
			select: {
				backup: true
			}
		} );

		// Code de validation généré par l'application.
		const otp = new TOTP( {
			label: session.user.email as string,
			secret: session.user.otp,
			issuer: "Simple File Storage",
			digits: 6,
			period: 30,
			algorithm: "SHA256"
		} );

		if (
			otp.validate( { token: session.user.otp, window: 1 } ) !== 0
			|| data?.backup !== result.data.otp
		)
		{
			// Suppression de l'autorisation à deux facteurs.
			await prisma.otp.delete( {
				where: {
					userId: session.user.id
				}
			} );
		}
	}

	// On modifie la langue sélectionnée par l'utilisateur dans les
	//  cookies de son navigateur.
	cookies().set( "NEXT_LOCALE", result.data.language );

	// On vérifie également si un avatar a été fourni.
	//  Note : si S3 est activé, l'utilisateur doit téléverser son
	//   avatar directement sur le service de stockage depuis le navigateur.
	const { avatar } = result.data;

	if (
		avatar.size !== 0
		&& avatar.name !== "undefined"
		&& avatar.type !== "application/octet-stream"
		&& process.env.S3_ENABLED !== "true"
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
		catch ( error )
		{
			// Si une erreur survient lors de la mise à jour de l'avatar,
			//  on l'envoie à Sentry et on affiche un message d'erreur.
			Sentry.captureException( error );

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

//
// Validation de l'autorisation à deux facteurs.
//
export async function validateOTP( formData: FormData )
{
	// On récupère d'abord la session de l'utilisateur et s'il a déjà
	//  activé la double authentification ou non.
	const session = await auth();

	if ( !session || session.user.otp )
	{
		return false;
	}

	// On créé ensuite un schéma de validation personnalisé pour
	//  les données du formulaire.
	const validation = z.object( {
		secret: z
			.string()
			.length( 32 )
			.regex( /^[A-Z2-7]+$/ ),
		code: z.string().length( 6 ).regex( /^\d+$/ )
	} );

	// On tente alors de valider les données du formulaire.
	const result = validation.safeParse( {
		secret: formData.get( "secret" ),
		code: formData.get( "code" )
	} );

	if ( !result.success )
	{
		return false;
	}

	// On génère ensuite une instance de double authentification
	//  à partir du secret de l'utilisateur avant de valider ou non
	//  le code fourni par l'utilisateur.
	const otp = new TOTP( {
		label: session.user.email as string,
		secret: result.data.secret,
		issuer: "Simple File Storage",
		digits: 6,
		period: 30,
		algorithm: "SHA256"
	} );

	const state = otp.validate( { token: result.data.code, window: 1 } ) === 0;

	// Si le code est valide, on génère un code de sauvegarde et
	//  on enregistre le secret dans la base de données.
	if ( state )
	{
		// Génération du code de sauvegarde.
		const pattern = "xxx-xxx-xxx";
		const length = Math.ceil( pattern.split( "x" ).length - 1 / 2 );
		const bytes = crypto.getRandomValues( new Uint8Array( length ) );
		let indice = 0;

		// Mise à jour de la base de données.
		const data = await prisma.otp.upsert( {
			where: {
				userId: session.user.id
			},
			update: {
				secret: result.data.secret
			},
			create: {
				userId: session.user.id,
				secret: result.data.secret,
				backup: pattern.replace( /x/g, () => bytes[ indice++ ].toString( 16 ) )
			}
		} );

		// Retour du code de sauvegarde pour l'utilisateur.
		return data.backup;
	}

	// On retourne enfin l'état de validation de l'autorisation à
	//  deux facteurs.
	return state;
}