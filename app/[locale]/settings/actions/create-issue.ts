//
// Action de création d'un nouveau signalement.
//

"use server";

import * as v from "valibot";
import prisma from "@/utilities/prisma";
import schema from "@/schemas/issue";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { transport } from "@/utilities/node-mailer";
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
	const result = v.safeParse( schema, {
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
			reason: result.issues[ 0 ].message
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
			area: result.output.area,
			userId: session.user.id,
			subject: result.output.subject,
			severity: result.output.severity,
			description: result.output.description
		}
	} );

	// On récupère ensuite la liste des adresses électroniques des
	//  administrateurs du site avant d'envoyer un courriel à chacun
	//  d'entre eux pour les informer du nouveau signalement.
	const admins = await prisma.user.findMany( {
		where: {
			role: "admin"
		}
	} );

	try
	{
		const info = await transport.sendMail( {
			to: admins.map( ( { email } ) => email ),
			from: process.env.SMTP_USERNAME,
			text: messages( "nodemailer.details", {
				area: result.output.area,
				subject: result.output.subject,
				severity: result.output.severity,
				description: result.output.description
			} ),
			subject: messages( "nodemailer.issue", {
				email: session.user.email
			} )
		} );

		if ( info.rejected.length )
		{
			// Erreur lors de l'envoi de certains courriels.
			logger.warn(
				{ source: __filename, info },
				"Email(s) could not be sent"
			);
		}
	}
	catch ( error )
	{
		// Erreur dans l'envoi des courriels.
		logger.error(
			{ source: __filename, error },
			"Node Mailer transport error"
		);
	}

	// On retourne enfin un message de succès.
	logger.info( { source: __filename, result, admins }, "Issue created" );

	return {
		success: true,
		reason: messages( "form.infos.issue_created" )
	};
}