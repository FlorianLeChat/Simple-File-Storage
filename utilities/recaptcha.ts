//
// Ajout du support de Google reCAPTCHA sur les actions côté serveur de NextJS.
//  Source : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
//

"use client";

import { toast } from "sonner";

export default async function serverAction(
	action: ( payload: FormData ) => void,
	formData: FormData,
	messages: ( key: string ) => string
)
{
	// On vérifie d'abord si le service reCAPTCHA est présent ou non.
	//  Note : si les services sont indisponibles, cela signifie qu'il a été
	//   explicitement désactivé dans les paramètres du site ou que les services
	//   ne sont pas encore chargés dans le navigateur de l'utilisateur.
	if ( typeof window.grecaptcha === "undefined" )
	{
		// Premier cas de figure : le serveur utilise reCAPTCHA mais le client
		//  n'a pas encore chargé les services de Google reCAPTCHA ou ils ont été
		//  explicitement désactivés par l'utilisateur.
		if ( process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true" )
		{
			toast.error( messages( "errors.recaptcha_failed" ), {
				duration: 10000,
				description: messages( "errors.recaptcha_error" )
			} );

			return false;
		}

		// Deuxième cas de figure : le serveur n'utilise pas reCAPTCHA.
		//  On exécute alors l'action côté serveur sans vérification.
		try
		{
			return action( formData );
		}
		catch
		{
			toast.error( messages( "errors.internal_error" ), {
				description: messages( "errors.server_error" )
			} );

			return false;
		}
	}

	// On créé après une promesse afin de gérer le chargement des services de
	//  Google reCAPTCHA et pouvoir retourner une réponse à l'utilisateur.
	return new Promise( ( resolve ) =>
	{
		// On attend ensuite que le service soit chargé dans le navigateur de
		//  l'utilisateur.
		window.grecaptcha.ready( async () =>
		{
			// Une fois prêt, on génère alors un jeton d'authentification auprès
			//  des services de Google reCAPTCHA avant de l'inclure dans la requête
			//  courante.
			const token = await window.grecaptcha.execute(
				process.env.NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY,
				{ action: "submit" }
			);

			formData.append( "recaptcha", token );

			// On résout enfin l'action côté serveur avec les données du formulaire
			//  récupérées précédemment.
			resolve( await action( formData ) );
		} );
	} );
}