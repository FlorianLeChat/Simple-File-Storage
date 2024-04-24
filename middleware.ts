//
// Mécanisme de routage pour les pages de l'application.
//
import { Prisma } from "@prisma/client";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import "./utilities/env";
import { getLanguages } from "./utilities/i18n";
import type { RecaptchaResponse } from "./interfaces/Recaptcha";

// Typage des fichiers provenant de la base de données.
type FileWithVersions = Prisma.FileGetPayload<{
	include: {
		versions: true;
	};
}>;

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
		const identifier = request.nextUrl.pathname
			.split( "/d/" )[ 1 ]
			.replace( /\.[^/.]+$/, "" );

		if ( identifier )
		{
			// On fait une requête à l'API pour récupérer le chemin
			//  du fichier à partir de son identifiant.
			const data = await fetch(
				new URL(
					`${ process.env.__NEXT_ROUTER_BASEPATH }/api/file/${ identifier }/${ request.nextUrl.search }`,
					request.url
				),
				{ headers: request.headers }
			);

			if ( data.ok )
			{
				// On récupère les informations du fichier à partir
				//  de la réponse sous format JSON avant de déterminer
				//  son extension.
				const file = ( await data.json() ) as FileWithVersions;
				const extension = file.name
					.replace( /^.*[/\\]/, "" )
					.replace( /^.*\./, "" )
					.toLowerCase();

				// On récupère le contenu du fichier à partir du système
				//  de fichiers du serveur.
				const content = await fetch(
					new URL(
						`${ process.env.__NEXT_ROUTER_BASEPATH }/files/${ file.userId }/${ file.id }/${ file.versions[ 0 ].id }.${ extension }`,
						request.url
					).href,
					{ headers: request.headers }
				);

				if ( !content.ok )
				{
					return new NextResponse( null, { status: 400 } );
				}

				try
				{
					// On récupère le tampon de données du fichier ainsi que
					//  la clé de chiffrement.
					const key = request.nextUrl.searchParams.get( "key" );
					const buffer = new Uint8Array( await content.arrayBuffer() );
					const cipher = await crypto.subtle.importKey(
						"raw",
						Buffer.from(
							key ?? process.env.AUTH_SECRET ?? "",
							"base64"
						),
						{
							name: "AES-GCM",
							length: 256
						},
						true,
						[ "encrypt", "decrypt" ]
					);

					// Une fois récupérés, on déchiffre le contenu du fichier
					//  avec son vecteur d'initialisation et on retourne le
					//  résultat comme une réponse classique.
					return new NextResponse(
						await crypto.subtle.decrypt(
							{
								iv: buffer.subarray( 0, 16 ),
								name: "AES-GCM"
							},
							cipher,
							buffer.subarray( 16 )
						)
					);
				}
				catch
				{
					// Si une erreur survient lors du déchiffrement du contenu
					//  du fichier, on retourne une erreur.
					return new NextResponse( null, { status: 400 } );
				}
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
				`${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/session`,
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
		// On traite les données du formulaire pour récupérer le jeton
		//  d'authentification reCAPTCHA transmis par l'utilisateur.
		let token;

		try
		{
			token = ( await request.formData() ).get( "1_recaptcha" );
		}
		catch
		{
			// Une erreur s'est produite lors de la récupération des données
			//  du formulaire.
			return new NextResponse( null, { status: 400 } );
		}

		if ( !token )
		{
			// Le jeton d'authentification reCAPTCHA est manquant ou invalide.
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
		"/((?!api/admin|api/user|api/version|api/versions|api/file|api/files|assets|locales|_next|_vercel|sitemap.xml|○manifest.webmanifest).*)"
	]
};

if ( process.env.__NEXT_ROUTER_BASEPATH )
{
	// Ajout du support du chemin de base de NextJS pour le routage
	//  effectué par le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/routing/middleware#base-path
	config.matcher.push( process.env.__NEXT_ROUTER_BASEPATH );
}