//
// Personnalisation de l'apparence et le contenu des courriels envoyés par Next Auth.
//  Source : https://next-auth.js.org/providers/email#customizing-emails
//
import { createTransport } from "nodemailer";
import type { EmailConfig } from "@auth/core/providers/email";

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
function html( parameters: { url: string; host: string } )
{
	const { url, host } = parameters;
	const escapedHost = host.replace( /\./g, "&#8203;." );

	return `
<body style="background: ${ colors.background };">
	<table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${ colors.mainBackground }; max-width: 600px; margin: auto; border-radius: 10px;">
		<tr>
			<td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.text };">
				Connexion à <strong>${ escapedHost }</strong> (<em>Simple File Storage</em>)
			</td>
		</tr>

		<tr>
			<td align="center" style="padding: 20px 0;">
				<table border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center" style="border-radius: 5px;" bgcolor="${ colors.buttonBackground }">
							<a href="${ url }" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.buttonText }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${ colors.buttonBorder }; display: inline-block; font-weight: bold;">
								Connexion directe
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>

		<tr>
			<td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${ colors.text };">
				<strong>Ce lien est valable 30 minutes.</strong> Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce courriel.
			</td>
		</tr>
	</table>
</body>
`;
}

// Modèle de courriel pour les appareils dépourvus de support HTML.
function text( { url, host }: { url: string; host: string } )
{
	return `Connectez-vous à ${ host }\n${ url }\n\n`;
}

// Fonction d'envoi des courriels via Nodemailer.
export default async function sendVerificationRequest( {
	url,
	provider: { server, from },
	identifier
}: {
	url: string;
	provider: EmailConfig;
	identifier: string;
} )
{
	const { host } = new URL( url );
	const transport = createTransport( server );

	const result = await transport.sendMail( {
		to: identifier,
		from,
		text: text( { url, host } ),
		html: html( { url, host } ),
		subject: "Connexion à votre compte Simple File Storage"
	} );

	const failed = result.rejected.concat( result.pending ).filter( Boolean );

	if ( failed.length )
	{
		throw new Error( `Email(s) (${ failed.join( ", " ) }) could not be sent` );
	}
}