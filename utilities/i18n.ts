//
// Options de configuration de Next Intl.
//  Source : https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components
//
import * as v from "valibot";
import deepmerge from "deepmerge";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";

import "@valibot/i18n/fr";
import { logger } from "./pino";

export function getLanguages()
{
	// Liste des langues disponibles.
	return [ "en", "fr" ];
}

export default getRequestConfig( async ( { locale } ) =>
{
	// Vérification de la langue demandée par l'utilisateur.
	if ( !getLanguages().includes( locale ) )
	{
		logger.error( { source: __filename, locale }, "Unsupported language" );
		notFound();
	}

	// Définition de la langue utilisée par Valibot.
	v.setGlobalConfig( { lang: locale } );

	// Récupération des traductions dans le système de fichiers.
	//  Note : les traductions manquantes sont fusionnées avec celles de
	//   la langue par défaut.
	return {
		timeZone: process.env.TZ,
		messages: deepmerge(
			( await import( "../locales/en.json" ) ).default,
			( await import( `../locales/${ locale }.json` ) ).default,
			{
				// Désactivation de la fusion des traductions manquantes
				//  relatives aux sections du consentement des cookies.
				//  Note : les traductions manquantes sont fusionnées avec
				//   celles de la langue par défaut et provoquent des duplications.
				customMerge: ( key ) =>
				{
					if ( key === "sections" )
					{
						return ( _, y ) => y;
					}

					return undefined;
				}
			}
		) as unknown as AbstractIntlMessages
	};
} );