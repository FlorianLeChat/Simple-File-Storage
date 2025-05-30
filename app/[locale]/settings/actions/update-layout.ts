//
// Action de mise à jour de l'apparence de l'interface utilisateur.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/layout";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { getTranslations } from "next-intl/server";

export async function updateLayout(
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
		font: formData.get( "font" ),
		color: formData.get( "color" ),
		theme: formData.get( "theme" )
	} );

	if ( !result.success )
	{
		// Si les données du formulaire sont invalides, on affiche le
		//  premier code d'erreur rencontré.
		logger.error( { source: __dirname, result }, "Invalid form data" );

		return {
			success: false,
			reason: result.issues[ 0 ].message
		};
	}

	// On créé ou on met à jour après les préférences de l'utilisateur dans la
	//  base de données.
	await prisma.preference.upsert( {
		where: {
			userId: session.user.id
		},
		update: {
			font: result.output.font,
			color: result.output.color,
			theme: result.output.theme
		},
		create: {
			userId: session.user.id,
			font: result.output.font,
			color: result.output.color,
			theme: result.output.theme
		}
	} );

	// On retourne enfin un message de succès.
	logger.debug( { source: __dirname, result }, "Layout preferences updated" );

	return {
		success: true,
		reason: messages( "form.infos.layout_updated" )
	};
}