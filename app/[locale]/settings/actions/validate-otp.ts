//
// Action de validation de l'autorisation à deux facteurs.
//

"use server";

import { z } from "zod";
import prisma from "@/utilities/prisma";
import { TOTP } from "otpauth";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { generateMetadata } from "@/app/layout";

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
		logger.error( { source: __filename, result }, "Invalid form data" );

		return false;
	}

	// On génère ensuite une instance de double authentification
	//  à partir du secret de l'utilisateur avant de valider ou non
	//  le code fourni par l'utilisateur.
	const meta = await generateMetadata();
	const otp = new TOTP( {
		label: session.user.email as string,
		secret: result.data.secret,
		issuer: meta.title as string,
		digits: 6,
		period: 30,
		algorithm: "SHA256"
	} );

	const state = otp.validate( { token: result.data.code, window: 1 } ) === 0;

	// Si le code est valide, on génère un code de sauvegarde et
	//  on enregistre le secret dans la base de données.
	if ( state )
	{
		// Génération du code de sauvegarde à 6 chiffres.
		const bytes = crypto.getRandomValues( new Uint8Array( 6 ) );
		const numbers = bytes.map( ( byte ) => byte % 10 );

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
				backup: numbers.join( "" )
			}
		} );

		// Retour du code de sauvegarde pour l'utilisateur.
		logger.debug( { source: __filename, data }, "Generated backup code" );

		return data.backup;
	}

	// On retourne enfin l'état de validation de l'autorisation à
	//  deux facteurs.
	logger.debug( { source: __filename, state }, "OTP validation state" );

	return state;
}