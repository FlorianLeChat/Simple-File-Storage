//
// Structure HTML dynamique des pages du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/template
//

"use client";

// Importation des dépendances.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Importation des fonctions utilitaires.
import { getAuthErrorMessage,
	getGenericErrorMessage } from "@/utilities/next-auth";

// Importation des composants.
import { useToast } from "./components/ui/use-toast";

export default function Template( { children }: { children: ReactNode } )
{
	// Déclaration des constantes.
	const pathname = usePathname();
	const { toast } = useToast();

	// Affichage automatique des messages d'erreur.
	useEffect( () =>
	{
		// On récupère d'abord le message d'erreur dans l'URL.
		const parameters = new URLSearchParams( window.location.search );
		const error = parameters.get( "error" ) ?? "";

		// On affiche ensuite le message d'erreur en fonction de la page
		//  sur laquelle où se trouve l'utilisateur.
		const description =
			pathname === "/"
				? getGenericErrorMessage( error )
				: pathname === "/auth" && getAuthErrorMessage( error );

		if ( description )
		{
			setTimeout( () =>
			{
				toast( {
					title: "Erreur",
					variant: "destructive",
					description
				} );
			}, 0 );
		}
	}, [ toast, pathname ] );

	// Affichage du rendu HTML de la page.
	return children;
}