//
// Ajout du support de Google reCAPTCHA sur les actions côté serveur de NextJS.
//  Source : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
//

"use client";

export default async function serverAction(
	action: ( payload: FormData ) => unknown,
	formData: FormData
)
{
	// On vérifie d'abord si le service reCAPTCHA est présent ou non.
	//  Note : si les services sont indisponibles, cela signifie qu'il a été
	//   explicitement désactivé dans les paramètres du site ou que les services
	//   ne sont pas encore chargés dans le navigateur de l'utilisateur.
	if ( typeof window.grecaptcha === "undefined" )
	{
		// Dans ce cas, on traite la requête comme si le service reCAPTCHA n'était
		//  pas activé et on laisse le serveur répondre à l'utilisateur.
		return action( formData );
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