//
// Structure HTML dynamique des pages du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/template
//

"use client";

// Importation des dépendances.
import { useEffect } from "react";
import type { ReactNode } from "react";

// Importation des composants.
import { useToast } from "./components/ui/use-toast";

export default function Template( { children }: { children: ReactNode } )
{
	// Déclaration des constantes.
	const { toast } = useToast();

	// Affichage automatique des messages d'erreur.
	useEffect( () =>
	{
		// On récupère d'abord le message d'erreur dans l'URL.
		const parameters = new URLSearchParams( window.location.search );
		const error = parameters.get( "error" );

		// On définit ensuite le message d'erreur à afficher en fonction
		//  des informations récupérées.
		//  Source : https://authjs.dev/guides/basics/pages#error-page
		let description: string | undefined;

		switch ( error )
		{
			case "Configuration":
				description =
					"Un problème est survenu lors de la lecture de la configuration du site. Veuillez vérifier les journaux d'événements pour plus d'informations.";
				break;

			case "AccessDenied":
				description =
					"Vous n'avez pas les autorisations nécessaires pour vous authentifier sur ce site.";
				break;

			case "Verification":
				description =
					"Votre jeton de vérification est invalide ou a expiré. Veuillez vous reconnecter.";
				break;

			default:
				break;
		}

		// On affiche enfin le message d'erreur s'il est défini.
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
	}, [ toast ] );

	// Affichage du rendu HTML de la page.
	return children;
}