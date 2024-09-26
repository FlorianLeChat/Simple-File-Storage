//
// Personnalisation de l'apparence et le contenu des courriels envoyés par Next Auth.
//  Source : https://next-auth.js.org/providers/email#customizing-emails
//
import { createTransport } from "nodemailer";
import { getTranslations } from "next-intl/server";
import type { EmailConfig } from "@auth/core/providers/email";
import { logger } from "./pino";

// Couleurs utilisées dans les courriels.
const colors = {
	text: "#444444",
	background: "#f9f9f9",
	buttonText: "white",
	buttonBorder: "#346df1",
	mainBackground: "white",
	buttonBackground: "#346df1"
};

// Modèle de courriel sous format HTML pour les clients compatibles.
function html( title: string, button: string, footer: string, url: string )
{
	return `
<body style="background: ${ colors.background };">
	<table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${ colors.mainBackground }; max-width: 600px; margin: auto; border-radius: 10px;">
		<tr>
			<td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.text };">
				${ title }
			</td>
		</tr>

		<tr>
			<td align="center" style="padding: 20px 0;">
				<table border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center" style="border-radius: 5px;" bgcolor="${ colors.buttonBackground }">
							<a href="${ url }" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.buttonText }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${ colors.buttonBorder }; display: inline-block; font-weight: bold;">
								${ button }
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>

		<tr>
			<td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.text };">
				${ footer }
			</td>
		</tr>
	</table>
</body>
`;
}

// Modèle de courriel pour les appareils dépourvus de support HTML.
function text( title: string )
{
	return title;
}

// Configuration du transport SMTP pour l'envoi des courriels.
export const transport = createTransport( {
	secure: process.env.SMTP_PORT === "465",
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT ? Number( process.env.SMTP_PORT ) : 0,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD
	},
	dkim: {
		domainName: process.env.DKIM_DOMAIN ?? "",
		privateKey: process.env.DKIM_PRIVATE_KEY ?? "",
		keySelector: process.env.DKIM_SELECTOR ?? ""
	}
} );

// Fonction d'envoi des courriels via Nodemailer.
export default async function sendVerificationRequest( {
	url,
	provider: { from },
	identifier
}: {
	url: string;
	provider: EmailConfig;
	identifier: string;
} )
{
	const { host } = new URL( url );
	const messages = await getTranslations();
	const escapedHost = host.replace( /\./g, "&#8203;." );

	const result = await transport.sendMail( {
		to: identifier,
		from,
		text: text( messages( "nodemailer.short_title", { host, url } ) ),
		html: html(
			messages
				.raw( "nodemailer.long_title" )
				.replace( "{host}", host )
				.replace( "{url}", url ),
			messages( "nodemailer.button" ),
			messages.raw( "nodemailer.footer" ).replace( "{host}", escapedHost ),
			url
		),
		subject: messages( "nodemailer.subject" )
	} );

	if ( result.rejected.length )
	{
		logger.error(
			{ source: __filename, result },
			"Email(s) could not be sent"
		);

		throw new Error(
			`Email(s) (${ result.rejected.join( ", " ) }) could not be sent`
		);
	}
}