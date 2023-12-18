//
// Actions du serveur pour les paramètres du compte utilisateur.
//

"use server";

import bcrypt from "bcrypt";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/account";
import { auth } from "@/utilities/next-auth";
import { cookies } from "next/headers";

//
// Mise à jour des informations du compte utilisateur.
//
export async function updateAccount(
	_state: Record<string, unknown>,
	formData: FormData
)
{
	// On récupère d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session )
	{
		// Si la session n'existe pas, on affiche un message d'erreur
		//  dans le formulaire (cela ne devrait jamais arriver).
		return {
			success: false,
			reason: "form.errors.invalid"
		};
	}

	// On tente ensuite de valider les données du formulaire.
	const result = schema.safeParse( {
		username: formData.get( "username" ),
		language: formData.get( "language" ),
		password: formData.get( "password" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche un
		//  message d'erreur générique.
		return {
			success: false,
			reason: "form.errors.generic"
		};
	}

	// On vérifie après si le nom d'utilisateur est différent de celui
	//  enregistré dans la base de données.
	if ( session.user.name !== result.data.username )
	{
		// Dans ce cas, on la met à jour dans la base de données.
		await prisma.user.update( {
			where: {
				id: session.user.id
			},
			data: {
				name: result.data.username
			}
		} );
	}

	// On modifie également la langue sélectionnée par l'utilisateur dans
	//  les cookies de son navigateur.
	cookies().set( "NEXT_LOCALE", result.data.language );

	// On met à jour par la même occasion le mot de passe de l'utilisateur
	//  si celui-ci a été fourni.
	if ( result.data.password )
	{
		await prisma.user.update( {
			where: {
				id: session.user.id
			},
			data: {
				password: await bcrypt.hash( result.data.password, 13 )
			}
		} );
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.account.success"
	};
}