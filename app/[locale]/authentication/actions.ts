//
// Actions du serveur pour le formulaire d'inscription et d'authentification.
//  Source :https://nextjs.org/docs/app/api-reference/functions/server-actions
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/authentication";

//
// Enregistrement d'un nouveau compte utilisateur.
//
export async function signUpAccount(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	const result = schema.safeParse( {
		email: formData.get( "email" ),
		password: formData.get( "password" )
	} );

	if ( !result.success )
	{
		return {
			success: false,
			reason: result.error.issues[ 0 ].message
		};
	}

	const user = await prisma.user.findUnique( {
		where: {
			email: result.data.email
		}
	} );

	if ( user )
	{
		return {
			success: false,
			reason: "OAuthAccountNotLinked"
		};
	}

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
	return {
		success: true,
		reason: "ValidationRequired"
	};
}