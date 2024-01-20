//
// Actions du serveur pour les paramètres d'apparence.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/layout";
import { auth } from "@/utilities/next-auth";

//
// Mise à jour des informations utilisateur.
//
export async function updateLayout(
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
		font: formData.get( "font" ),
		color: formData.get( "color" ),
		theme: formData.get( "theme" )
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

	// On vérifie après si les préférences de l'utilisateur sont
	//  différentes de celles enregistrées dans la base de données.
	if ( session.user.preferences.font !== result.data.font )
	{
		// Police de caractères
		await prisma.preference.upsert( {
			where: {
				userId: session.user.id
			},
			update: {
				font: result.data.font
			},
			create: {
				userId: session.user.id,
				font: result.data.font
			}
		} );
	}

	if ( session.user.preferences.color !== result.data.color )
	{
		// Couleur d'accentuation.
		await prisma.preference.upsert( {
			where: {
				userId: session.user.id
			},
			update: {
				color: result.data.color
			},
			create: {
				userId: session.user.id,
				color: result.data.color
			}
		} );
	}

	if ( session.user.preferences.theme !== result.data.theme )
	{
		// Thème de couleur.
		await prisma.preference.upsert( {
			where: {
				userId: session.user.id
			},
			update: {
				theme: result.data.theme
			},
			create: {
				userId: session.user.id,
				theme: result.data.theme
			}
		} );
	}

	// On retourne enfin un message de succès.
	return {
		success: true,
		reason: "settings.layout.success"
	};
}