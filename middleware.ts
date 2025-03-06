//
// Mécanisme de routage pour les pages de l'application.
//
import mime from "mime";
import { Prisma } from "@prisma/client";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import "./utilities/env";
import { getLanguages } from "./utilities/i18n";
import { checkRecaptcha } from "./utilities/recaptcha";

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
	if ( request.method === "GET" && request.nextUrl.pathname.startsWith( "/d/" ) )
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
					`/api/file/${ identifier }/${ request.nextUrl.search }`,
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
				const headers = new Headers();
				headers.set( "X-Auth-Secret", process.env.AUTH_SECRET ?? "" );

				const content = await fetch(
					new URL(
						`/api/public/files/${ file.userId }/${ file.id }/${ file.versions[ 0 ].id }.${ extension }`,
						data.url
					),
					{ headers }
				);

				if ( !content.ok )
				{
					return new NextResponse( "File not found", { status: 404 } );
				}

				try
				{
					// On récupère le tampon de données du fichier ainsi que
					//  la clé de chiffrement afin de vérifier l'intégrité
					//  du contenu du fichier.
					const key = request.nextUrl.searchParams.get( "key" );
					const buffer = new Uint8Array( await content.arrayBuffer() );
					const digest = await crypto.subtle.digest(
						"SHA-256",
						buffer
					);

					const hash = Array.from( new Uint8Array( digest ) )
						.map( ( byte ) => byte.toString( 16 ).padStart( 2, "0" ) )
						.join( "" );

					if ( hash !== file.versions[ 0 ].hash )
					{
						return new NextResponse( "File integrity compromised", {
							status: 422
						} );
					}

					// Lorsque la vérification est terminée, on retourne le
					//  contenu du fichier déchiffré comme une réponse classique.
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

					const decrypted = await crypto.subtle.decrypt(
						{
							iv: buffer.subarray( 0, 16 ),
							name: "AES-GCM"
						},
						cipher,
						buffer.subarray( 16 )
					);

					const response = new NextResponse( decrypted );
					response.headers.set(
						"Content-Type",
						mime.getType( file.name ) ?? "application/octet-stream"
					);

					return response;
				}
				catch
				{
					// Si une erreur survient lors du déchiffrement du contenu
					//  du fichier, on retourne une erreur.
					return new NextResponse( "File decryption failed", {
						status: 503
					} );
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

	// On vérifie également si le service reCAPTCHA est activé ou non
	//  et s'il s'agit d'une requête de type POST.
	const isPostRequest = request.method === "POST";
	const isRecaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true";
	const isValidRecaptchaRequest = isRecaptchaEnabled && isPostRequest;

	if ( isValidRecaptchaRequest )
	{
		const response = await checkRecaptcha( request );

		if ( response )
		{
			return response;
		}
	}

	// On créé enfin le mécanisme de gestion des langues et traductions.
	//  Source : https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components
	const i18nRouting = createIntlMiddleware( {
		locales: getLanguages(),
		localePrefix: "never",
		defaultLocale: "en"
	} );

	return i18nRouting( request );
}

export const config = {
	matcher: [
		"/",
		"/((?!api/admin|api/user|api/version|api/versions|api/file|api/public|api/files|monitoring|_next|_vercel|.*\\..*).*)"
	]
};