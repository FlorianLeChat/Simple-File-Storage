//
// Actions du serveur pour le formulaire d'inscription et de connexion.
//  Source : https://github.com/nextauthjs/next-auth/blob/87b037f0560c09ee186e8c0b50ae368bbff40cbe/packages/core/src/lib/pages/signin.tsx#L7-L21
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/utilities/next-auth";

//
// Enregistrement d'un nouveau compte utilisateur.
//
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
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		password: ""
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		return {
			success: false,
			reason: `zod.errors.${ result.error.issues[ 0 ].code }`
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
		return {
			success: false,
			reason: "form.errors.email_used"
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

		if ( !response )
		{
			// Lorsque la demande de validation de l'adresse électronique
			//  semble ne pas renvoyer de réponse, on affiche un message
			//  d'erreur sur la page d'authentification.
			return {
				success: false,
				reason: "form.errors.email_error"
			};
		}
	}

	// On retourne enfin un message de succès à l'utilisateur afin
	//  qu'il puisse valider son adresse électronique.
	return {
		success: true,
		reason: "form.info.email_validation"
	};
}

//
// Connexion à un compte utilisateur existant.
//
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
		await signIn( provider as string, {
			redirectTo: "/dashboard"
		} );
	}

	// Dans le cas contraire, on tente de valider les informations
	//  d'authentification fournies par l'utilisateur.
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		password: formData.get( "password" ),
		remembered: formData.get( "remembered" ) === "on"
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		return {
			success: false,
			reason: `zod.errors.${ result.error.issues[ 0 ].code }`
		};
	}

	if ( !result.data.password )
	{
		// Dans certains cas, le mot de passe fourni peut être vide, ce qui
		//  signifie que l'utilisateur a tenté de se connecter via une
		//  validation de son adresse électronique.
		const response = await signIn( "nodemailer", {
			email: result.data.email,
			redirect: false,
			redirectTo: "/dashboard",
			sendVerificationRequest: true
		} );

		return {
			success: !!response,
			reason: response
				? "form.info.email_validation"
				: "form.errors.email_error"
		};
	}

	try
	{
		// Dans le cas contraire, on tente alors une authentification via
		//  les informations d'authentification fournies avant de rediriger
		//  l'utilisateur vers la page de son tableau de bord.
		const response = await signIn( "credentials", {
			email: result.data.email,
			password: result.data.password,
			redirectTo: "/dashboard"
		} );

		if ( response )
		{
			// Lorsqu'une réponse semble avoir été récupérée précédemment,
			//  on tente alors de mettre à jour la durée de vie du cookie
			//  d'authentification de l'utilisateur avant de le rediriger
			//  vers la page de la réponse.
			//   Source : https://github.com/nextauthjs/next-auth/discussions/3794
			const cookiesList = cookies();
			const authCookie = cookiesList.get( "authjs.session-token" );

			if ( authCookie )
			{
				cookiesList.set( {
					// https://github.com/nextauthjs/next-auth/blob/065b7e9d9b8d046758e381c88ef351e65764ea5f/packages/core/src/index.ts#L238-L243
					...authCookie,
					maxAge: 24 * 60 * 60 * ( result.data.remembered ? 30 : 1 )
				} );
			}

			redirect( response );
		}
	}
	catch ( error )
	{
		// En cas d'erreur, on affiche un message d'erreur sur la page
		//  d'authentification avant de relancer l'erreur.
		if ( error instanceof AuthError )
		{
			return {
				success: false,
				reason: `authjs.errors.${ error.type }`
			};
		}

		throw error;
	}

	// On retourne enfin un message d'erreur par défaut au l'utilisateur
	//  ne correspondant à aucun des cas précédents.
	return {
		success: false,
		reason: "form.errors.invalid_credentials"
	};
}

//
// Déconnexion d'un compte utilisateur.
//
export async function signOutAccount()
{
	// On tente de déconnecter l'utilisateur de son compte utilisateur
	//  avant de rediriger celui-ci vers la page d'accueil.
	await signOut( {
		redirectTo: "/"
	} );
}