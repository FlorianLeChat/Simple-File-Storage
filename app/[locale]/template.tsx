//
// Structure HTML dynamique des pages du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/template
//

"use client";

// Importation des dépendances.
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect } from "react";

export default function Template( { children }: { children: ReactNode } )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form.errors" );

	// Affichage automatique des messages d'erreur.
	useEffect( () =>
	{
		// On récupère d'abord le message d'erreur dans l'URL.
		const parameters = new URLSearchParams( window.location.search );
		const error = parameters.get( "error" ) ?? "";

		// On affiche ensuite le message d'erreur en fonction de la page
		//  sur laquelle où se trouve l'utilisateur.
		if ( error )
		{
			setTimeout( () =>
			{
				toast.error( messages( "internal_error" ), {
					description: messages( "server_error" )
				} );
			}, 0 );
		}
	}, [ messages ] );

	// Affichage du rendu HTML de la page.
	return children;
}