//
// Action de création d'un nouveau compte utilisateur.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import { logger } from "@/utilities/pino";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/utilities/next-auth";
import { getTranslations } from "next-intl/server";

export async function signUpAccount(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( session )
	{
		// Si la session existe, on redirige l'utilisateur vers la page
		//  de son tableau de bord.
		return redirect( "/dashboard" );
	}

	// On tente de valider les informations d'authentification fournies
	//  par l'utilisateur.
	const messages = await getTranslations();
	const result = schema.pick( { email: true } ).safeParse( {
		email: formData.get( "email" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		logger.error( { source: __filename, result }, "Invalid form data" );

		return {
			success: false,
			reason: messages( `zod.${ result.error.issues[ 0 ].code }` )
		};
	}

	// Dans le cas contraire, on vérifie si un utilisateur existe déjà
	//  dans la base de données avec l'adresse électronique fournie.
	const user = await prisma.user.findUnique( {
		where: {
			email: result.data.email
		}
	} );

	if ( user )
	{
		// Si c'est le cas, on indique à l'utilisateur que l'adresse
		//  électronique fournie est déjà utilisée.
		logger.error(
			{ source: __filename, email: result.data.email },
			"Email already used"
		);

		return {
			success: false,
			reason: messages( "form.errors.email_used" )
		};
	}

	// On vérifie ensuite si une demande de validation de l'adresse
	//  électronique a déjà été envoyée.
	const validation = await prisma.verificationToken.findFirst( {
		where: {
			identifier: result.data.email
		}
	} );

	if ( !validation )
	{
		// Si ce n'est pas le cas, on envoie immédiatement une demande
		//  de validation de l'adresse électronique fournie.
		const response = await signIn( "nodemailer", {
			email: result.data.email,
			redirect: false,
			redirectTo: "/dashboard",
			sendVerificationRequest: true
		} );

		logger.info(
			{ source: __filename, email: result.data.email },
			"Sign up with email"
		);

		if ( !response )
		{
			// Lorsque la demande de validation de l'adresse électronique
			//  semble ne pas renvoyer de réponse, on affiche un message
			//  d'erreur sur la page d'authentification.
			logger.error(
				{ source: __filename, email: result.data.email },
				"Email validation request failed"
			);

			return {
				success: false,
				reason: messages( "authjs.errors.EmailSignup" )
			};
		}
	}

	// On retourne enfin un message de succès à l'utilisateur afin
	//  qu'il puisse valider son adresse électronique.
	logger.info(
		{ source: __filename, email: result.data.email },
		"Email validation request sent"
	);

	return {
		success: true,
		reason: messages( "form.infos.email_validation" )
	};
}