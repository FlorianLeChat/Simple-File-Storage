//
// Action de création d'un nouveau signalement.
//

"use server";

import prisma from "@/utilities/prisma";
import schema from "@/schemas/issue";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { getTranslations } from "next-intl/server";

export async function createIssue(
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
	const result = schema.safeParse( {
		area: formData.get( "area" ),
		subject: formData.get( "subject" ),
		severity: formData.get( "severity" ),
		description: formData.get( "description" )
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

	// Dans le cas contraire, on vérifie également si l'utilisateur
	//  n'a pas déjà signalé un bogue dans les dernières 24 heures.
	const issue = await prisma.issue.findFirst( {
		where: {
			userId: session.user.id,
			createdAt: {
				gte: new Date( Date.now() - 86400000 )
			}
		}
	} );

	if ( issue )
	{
		// Dans ce cas là, on affiche un message d'erreur dans le
		//  formulaire.
		logger.error( { source: __filename, issue }, "Too many issues" );

		return {
			success: false,
			reason: messages( "form.errors.too_many" )
		};
	}

	// Si tout est bon, on crée le signalement dans la base de données.
	await prisma.issue.create( {
		data: {
			area: result.data.area,
			userId: session.user.id,
			subject: result.data.subject,
			severity: result.data.severity,
			description: result.data.description
		}
	} );

	// On retourne enfin un message de succès.
	logger.info( { source: __filename, result }, "Issue created" );

	return {
		success: true,
		reason: messages( "form.infos.issue_created" )
	};
}