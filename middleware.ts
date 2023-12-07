//
// Mécanisme de routage pour les pages de l'application.
//
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import type { RecaptchaResponse } from "./interfaces/Recaptcha";

export default async function middleware( request: NextRequest )
{
	// On vérifie d'abord si le service reCAPTCHA est activé ou non.
	if ( process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true" )
	{
		// On vérifie ensuite s'il s'agit d'une requête de type GET ou POST.
		//  Note : les requêtes de type GET sont utilisées pour les diverses
		//   statistiques, tant disque que les requêtes de type POST sont
		//   utilisées pour la vérification de la validité des formulaires.
		if (
			( request.method === "GET"
				&& request.nextUrl.pathname === "/api/recaptcha" )
			|| request.method === "POST"
		)
		{
			// On vérifie après si le corps de la requête est vide ou non.
			const body = await request.text();

			if ( body.length === 0 )
			{
				return new NextResponse( null, { status: 400 } );
			}

			// On vérifie également si un jeton d'authentification a été
			//  transmis par l'utilisateur.
			const { token } = JSON.parse( body ) as { token?: string };

			if ( !token )
			{
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

				// Dans le cas contraire, on continue le traitement de la requête.
				return new NextResponse( null, { status: 200 } );
			}
		}
	}

	// On créé le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components
	const handleI18nRouting = createIntlMiddleware( {
		locales: [ "en", "fr" ],
		localePrefix: "never",
		defaultLocale: "en"
	} );

	// On modifie enfin la réponse de la requête courante afin de modifier
	//  le chemin d'accès applicable au cookie créé par Next Intl.
	//  Sources : https://github.com/amannn/next-intl/issues/486 / https://github.com/amannn/next-intl/pull/589
	const response = handleI18nRouting( request );
	response.cookies.set(
		"NEXT_LOCALE",
		response.headers.get( "x-middleware-request-x-next-intl-locale" ) ?? "en",
		{
			// https://github.com/amannn/next-intl/blob/2f267edb0e414692d3c7c86fe52130cc2ef89a3d/packages/next-intl/src/middleware/middleware.tsx#L236-L238
			path: process.env.__NEXT_ROUTER_BASEPATH,
			maxAge: 60 * 60 * 24 * 365,
			sameSite: "strict"
		}
	);

	return response;
}

export const config = {
	matcher: [ "/", "/((?!api/auth|_next|_vercel|.*\\..*).*)" ]
};

if ( process.env.__NEXT_ROUTER_BASEPATH )
{
	// Ajout du support du chemin de base de NextJS pour le routage
	//  effectué par le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/routing/middleware#base-path
	config.matcher.push( process.env.__NEXT_ROUTER_BASEPATH );
}