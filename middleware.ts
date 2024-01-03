//
// Mécanisme de routage pour les pages de l'application.
//
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { getLanguages } from "./utilities/i18n";
import type { RecaptchaResponse } from "./interfaces/Recaptcha";

export default async function middleware( request: NextRequest )
{
	// On vérifie d'abord si le service reCAPTCHA est activé ou non.
	if ( process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true" )
	{
		// On vérifie ensuite s'il s'agit d'une requête de type POST.
		if ( request.method === "POST" )
		{
			// On récupère après la requête sous format de formulaire avant
			//  de vérifier si elle contient un jeton d'authentification.
			const token = ( await request.formData() ).get( "1_recaptcha" );

			if ( !token )
			{
				// Si ce n'est pas le cas, on bloque la requête courante.
				return new NextResponse( null, { status: 400 } );
			}

			// On effectue une requête à l'API de Google reCAPTCHA afin de vérifier
			//  la validité du jeton d'authentification auprès de leurs services.
			const data = await fetch(
				`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.RECAPTCHA_SECRET_KEY }&response=${ token }`,
				{ method: "POST" }
			);

			if ( data.ok )
			{
				// Si la requête a été traitée avec succès, on vérifie alors le
				//  résultat obtenu de l'API de Google reCAPTCHA sous format JSON.
				const json = ( await data.json() ) as RecaptchaResponse;

				if ( !json.success || json.score < 0.7 )
				{
					// En cas de score insuffisant ou si la réponse est invalide,
					//  on bloque la requête courante.
					return new NextResponse( null, { status: 400 } );
				}

				// Dans le cas contraire et dans le cas où la requête a cherchée
				//  à accéder à l'API de Google reCAPTCHA, on retourne une réponse
				//  vide avec un code de statut 200.
				if ( request.nextUrl.pathname === "/api/recaptcha" )
				{
					return new NextResponse( null, { status: 200 } );
				}
			}
		}
	}

	// On créé enfin le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components
	const handleI18nRouting = createIntlMiddleware( {
		locales: getLanguages(),
		localePrefix: "never",
		defaultLocale: "en"
	} );

	return handleI18nRouting( request );
}

export const config = {
	matcher: [ "/", "/((?!api/admin|api/auth|_next|_vercel|.*\\..*).*)" ]
};

if ( process.env.__NEXT_ROUTER_BASEPATH )
{
	// Ajout du support du chemin de base de NextJS pour le routage
	//  effectué par le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/routing/middleware#base-path
	config.matcher.push( process.env.__NEXT_ROUTER_BASEPATH );
}