//
// Mécanisme de routage pour les pages de l'application.
//
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { getLanguages } from "./utilities/i18n";
import type { RecaptchaResponse } from "./interfaces/Recaptcha";

export default async function middleware( request: NextRequest )
{
	// On vérifie d'abord si la requête courante est de type GET
	//  et si elle cherche à accéder à un fichier utilisateur.
	if (
		request.method === "GET"
		&& request.nextUrl.pathname.startsWith( "/d/" )
	)
	{
		// Si c'est le cas, on récupère l'identifiant du fichier
		//  à partir de l'URL de la requête.
		const identifier = request.nextUrl.pathname.split( "/d/" )[ 1 ];

		if ( identifier )
		{
			// On fait une requête à l'API pour récupérer le chemin
			//  du fichier à partir de son identifiant.
			const data = await fetch(
				new URL(
					`${ process.env.__NEXT_ROUTER_BASEPATH }/api/file/${ identifier }`,
					request.url
				),
				{ headers: request.headers }
			);

			if ( data.ok )
			{
				// Si l'API semble avoir traitée la requête avec succès,
				//  on retourne une redirection vers le fichier.
				return NextResponse.rewrite( await data.text() );
			}
		}
	}

	// On bloque aussi toutes les requêtes qui cherchent à accéder
	//  aux fichiers téléversés par les utilisateurs sans passer
	//  par l'API précédemment créée.
	if ( request.nextUrl.pathname.startsWith( "/files/" ) )
	{
		return new NextResponse( null, { status: 404 } );
	}

	// On restreint après l'accès aux avatars personnalisés aux
	//  utilisateurs connectés pour éviter d'être récupérés par
	//  des robots d'indexation.
	if ( request.nextUrl.pathname.startsWith( "/avatars/" ) )
	{
		const data = await fetch(
			new URL(
				`${ process.env.__NEXT_ROUTER_BASEPATH }/api/session`,
				request.url
			),
			{ headers: request.headers }
		);

		if ( data.ok )
		{
			// La session existe, on retourne le fichier demandé
			//  comme une requête classique.
			return NextResponse.next();
		}

		// La session n'existe pas, on retourne une erreur 403.
		return new NextResponse( null, { status: 403 } );
	}

	// On vérifie également si le service reCAPTCHA est activé ou non
	//  et s'il s'agit d'une requête de type POST.
	if (
		process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true"
		&& request.method === "POST"
	)
	{
		// On récupère la requête sous format de formulaire avant de vérifier
		//  si elle contient un jeton d'authentification.
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
	matcher: [
		"/",
		"/((?!api/admin|api/auth|api/file|api/session|assets|locales|_next|_vercel|manifest.webmanifest).*)"
	]
};

if ( process.env.__NEXT_ROUTER_BASEPATH )
{
	// Ajout du support du chemin de base de NextJS pour le routage
	//  effectué par le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/routing/middleware#base-path
	config.matcher.push( process.env.__NEXT_ROUTER_BASEPATH );
}