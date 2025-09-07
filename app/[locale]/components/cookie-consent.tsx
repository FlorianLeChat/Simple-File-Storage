//
// Composant du consentement des cookies.
//

"use client";

import { useEffect } from "react";
import { useMessages } from "next-intl";
import { usePathname } from "next/navigation";
import { run,
	type ConsentModalOptions,
	type PreferencesModalOptions } from "vanilla-cookieconsent";

export default function CookieConsent()
{
	// Déclaration des variables d'état.
	const pathname = usePathname();
	const messages = useMessages() as unknown as {
		form: Record<string, Record<string, string>>;
		consentModal: ConsentModalOptions;
		preferencesModal: PreferencesModalOptions;
	};

	// Affichage du consentement des cookies.
	//  Source : https://cookieconsent.orestbida.com/reference/api-reference.html
	useEffect( () =>
	{
		// Définition de l'environnement de production.
		run( {
			// Désactivation de l'interaction avec la page.
			disablePageInteraction: true,

			// Disparition du mécanisme pour les robots.
			hideFromBots: process.env.NEXT_PUBLIC_ENV === "production",

			// Activation automatique de la fenêtre de consentement.
			autoShow: false,

			// Paramètres de l'interface utilisateur.
			guiOptions: {
				consentModal: {
					layout: "bar",
					position: "bottom center"
				}
			},

			// Configuration des catégories de cookies.
			categories: {
				necessary: {
					enabled: true,
					readOnly: true
				}
			},

			// Configuration des traductions.
			language: {
				default: "en",
				translations: {
					en: {
						consentModal: messages.consentModal,
						preferencesModal: messages.preferencesModal
					}
				}
			}
		} );
	}, [ pathname, messages ] );

	// Le composant n'affiche rien.
	return null;
}