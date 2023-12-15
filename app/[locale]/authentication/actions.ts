//
// Actions du serveur pour le formulaire d'inscription et d'authentification.
//  Source :https://nextjs.org/docs/app/api-reference/functions/server-actions
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";
import { signIn, signOut } from "@/utilities/next-auth";

//
// Enregistrement d'un nouveau compte utilisateur.
//
export async function signUpAccount(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On tente d'abord de valider les informations d'authentification
	//  fournies par l'utilisateur.
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		password: formData.get( "password" )
	} );

	if ( !result.success )
	{
		// Si les informations d'authentification fournies sont invalides,
		//  on affiche un message d'erreur sur la page d'authentification.
		return {
			success: false,
			reason: result.error.issues[ 0 ].message
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
			reason: "OAuthAccountNotLinked"
		};
	}

	// On tente ensuite de créer un nouveau compte utilisateur via
	//  les informations d'authentification fournies.
	const validation = await prisma.verificationToken.findFirst( {
		where: {
			identifier: result.data.email,
			expires: {
				gte: new Date()
			}
		}
	} );

	if ( !validation )
	{
		// TODO : Envoyer un courriel de validation.
	}

	// On retourne enfin un message de succès à l'utilisateur afin
	//  qu'il puisse valider son adresse électronique.
	return {
		success: true,
		reason: "ValidationRequired"
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
	// On vérifie d'abord si l'utilisateur a tenté de se connecter via
	//  un fournisseur d'authentification externe.
	const provider = formData.get( "provider" );

	if ( provider )
	{
		try
		{
			// Si c'est le cas, on tente une authentification via le fournisseur
			//  d'authentification externe avant de rediriger l'utilisateur vers
			//  la page de son tableau de bord.
			redirect(
				await signIn( provider as string, {
					redirect: false,
					redirectTo: "/dashboard"
				} )
			);
		}
		catch ( error )
		{
			// En cas d'erreur, on affiche un message d'erreur sur la page
			//  d'authentification.
			return {
				success: false,
				reason: "OAuthCallbackError"
			};
		}
	}

	// Dans le cas contraire, on tente de valider les informations
	//  d'authentification fournies par l'utilisateur.
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		password: formData.get( "password" )
	} );

	if ( !result.success )
	{
		// Si les informations d'authentification fournies sont invalides,
		//  on affiche un message d'erreur sur la page d'authentification.
		return {
			success: false,
			reason: result.error.issues[ 0 ].message
		};
	}

	try
	{
		// Dans le cas contraire, on tente alors une authentification via
		//  les informations d'authentification fournies avant de rediriger
		//  l'utilisateur vers la page de son tableau de bord.
		redirect(
			await signIn( "credentials", {
				email: result.data.email,
				password: result.data.password,
				redirect: false,
				redirectTo: "/dashboard"
			} )
		);
	}
	catch ( error )
	{
		// En cas d'erreur, on affiche un message d'erreur sur la page
		//  d'authentification.
		return {
			success: false,
			reason: "CredentialsSignin"
		};
	}

	// On retourne enfin un message d'erreur par défaut au l'utilisateur
	//  ne correspondant à aucun des cas précédents.
	return {
		success: false,
		reason: "CredentialsSignin"
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