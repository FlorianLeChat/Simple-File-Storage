//
// Action de connexion à un compte utilisateur.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import * as v from "valibot";
import schema from "@/schemas/authentication";
import { logger } from "@/utilities/pino";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/utilities/next-auth";
import { getTranslations } from "next-intl/server";

export async function signInAccount(
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

	// On vérifie si l'utilisateur a tenté de se connecter via
	//  fournisseur d'authentification externe.
	const provider = formData.get( "provider" );

	if ( provider )
	{
		// Si c'est le cas, on tente une authentification via le fournisseur
		//  d'authentification externe avant de rediriger l'utilisateur vers
		//  la page de son tableau de bord.
		logger.info( { source: __filename, provider }, "Sign in with provider" );

		await signIn( provider as string, {
			redirectTo: "/dashboard"
		} );
	}

	// Dans le cas contraire, on tente de valider les informations
	//  d'authentification fournies par l'utilisateur.
	const messages = await getTranslations();
	const result = v.safeParse( schema, {
		email: formData.get( "email" ),
		password: formData.get( "password" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		logger.error( { source: __filename, result }, "Invalid form data" );

		return {
			success: false,
			reason: result.issues[ 0 ].message
		};
	}

	if ( !result.output.password || process.env.NEXT_PUBLIC_ENV === "production" )
	{
		// Si le mot de passe est vide, l'utilisateur cherche probablement
		//  à se connecter via une validation de son adresse électronique.
		//  L'authentification avec mot de passe est désactivée en production.
		const response = await signIn( "nodemailer", {
			email: result.output.email,
			redirect: false,
			redirectTo: "/dashboard",
			sendVerificationRequest: true
		} );

		logger.info(
			{ source: __filename, email: result.output.email },
			"Sign in with email"
		);

		return {
			success: !!response,
			reason: response
				? messages( "form.infos.email_validation" )
				: messages( "authjs.errors.EmailSignup" )
		};
	}

	try
	{
		// Dans le cas contraire, on tente alors une authentification via
		//  les informations d'authentification fournies avant de rediriger
		//  l'utilisateur vers la page de son tableau de bord.
		logger.info(
			{ source: __filename, email: result.output.email },
			"Sign in with credentials"
		);

		await signIn( "credentials", {
			email: result.output.email,
			password: result.output.password,
			redirectTo: "/dashboard"
		} );
	}
	catch ( error )
	{
		// En cas d'erreur, on affiche un message d'erreur sur la page
		//  d'authentification avant de relancer l'erreur.
		if ( error instanceof AuthError )
		{
			logger.error( { source: __filename, error }, "Authentication error" );

			return {
				success: false,
				reason: messages( `authjs.errors.${ error.type }` )
			};
		}

		logger.error( { source: __filename, error }, "Sign in error" );

		throw error;
	}

	// On retourne enfin un message d'erreur par défaut au l'utilisateur
	//  ne correspondant à aucun des cas précédents.
	logger.error(
		{ source: __filename, email: result.output.email },
		"Sign in error"
	);

	return {
		success: false,
		reason: messages( "authjs.errors.CredentialsSignin" )
	};
}