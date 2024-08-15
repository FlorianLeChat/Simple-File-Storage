//
// Action de mise à jour des informations utilisateur.
//

"use server";

import * as v from "valibot";
import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/user";
import { join } from "path";
import { TOTP } from "otpauth";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { getTranslations } from "next-intl/server";
import { generateMetadata } from "@/app/layout";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, readdir, rm, writeFile } from "fs/promises";

export async function updateUser(
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
	const result = v.safeParse( schema, {
		username: formData.get( "username" ),
		email: formData.get( "email" ) ?? session.user.email,
		password: formData.get( "password" ) ?? "",
		otp: formData.get( "otp" ),
		language: formData.get( "language" ),
		avatar: formData.get( "avatar" )
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
			name: result.output.username,
			email: !session.user.oauth ? result.output.email : undefined,
			password:
				!session.user.oauth && result.output.password
					? await bcrypt.hash( result.output.password, 15 )
					: undefined
		}
	} );

	// On ajoute une notification pour prévenir l'utilisateur que son
	//  mot de passe a été modifié récemment.
	if ( result.output.password && !session.user.oauth )
	{
		await prisma.notification.create( {
			data: {
				title: 1,
				userId: session.user.id,
				message: 1
			}
		} );

		logger.debug( { source: __filename }, "Created password notification" );
	}

	// On vérifie si l'utilisateur tente de désactiver la double
	//  authentification grâce à son code de secours ou au code
	//  de validation généré par l'application d'authentification.
	if ( result.output.otp && session.user.otp )
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
		const meta = await generateMetadata();
		const otp = new TOTP( {
			label: session.user.email as string,
			secret: session.user.otp,
			issuer: meta.title as string,
			digits: 6,
			period: 30,
			algorithm: "SHA256"
		} );

		if (
			otp.validate( { token: result.output.otp, window: 1 } ) === 0
			|| data?.backup === result.output.otp
		)
		{
			// Suppression de l'autorisation à deux facteurs.
			logger.debug( { source: __filename }, "Deleted OTP" );

			await prisma.otp.delete( {
				where: {
					userId: session.user.id
				}
			} );
		}
	}

	// On modifie la langue sélectionnée par l'utilisateur dans les
	//  cookies de son navigateur.
	cookies().set( "NEXT_LOCALE", result.output.language );

	// On vérifie également si un avatar a été fourni.
	const { avatar } = result.output;

	if (
		avatar.size !== 0
		&& avatar.name !== "undefined"
		&& avatar.type !== "application/octet-stream"
	)
	{
		// Si c'est le cas, on récupère le tampon de l'avatar téléversé
		//   pour vérifier son type au travers des nombres magiques.
		const info = await fileTypeFromBuffer(
			new Uint8Array( await result.output.avatar.arrayBuffer() )
		);

		if ( !info )
		{
			// Si les informations de l'avatar ne sont pas disponibles,
			//  on indique que le type de fichier est incorrect ou qu'il
			//  contient des données textuelles.
			logger.error(
				{ source: __filename, result },
				"Avatar file type not found"
			);

			return {
				success: false,
				reason: messages( "zod.wrong_file_type" )
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
			logger.error(
				{ source: __filename, result },
				"Avatar file type not accepted"
			);

			return {
				success: false,
				reason: messages( "zod.wrong_file_type" )
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
			logger.error(
				{ source: __filename, error },
				"Error updating avatar"
			);

			Sentry.captureException( error );

			return {
				success: false,
				reason: messages( "form.errors.file_system" )
			};
		}
	}

	// On retourne enfin un message de succès.
	logger.debug( { source: __filename, result }, "User preferences updated" );

	return {
		success: true,
		reason: messages( "form.infos.user_updated" )
	};
}