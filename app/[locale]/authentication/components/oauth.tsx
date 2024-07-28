//
// Composant des fournisseurs externes pour le formulaire d'authentification.
//

"use client";

import { z } from "zod";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Button } from "../../components/ui/button";
import { signInAccount } from "../actions/signin";

export default function OAuthForm()
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isLoading, setLoading ] = useState( false );
	const [ signInState, signInAction ] = useFormState( signInAccount, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			email: "",
			password: ""
		}
	} );

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si les deux variables d'état liées aux actions
		//  de formulaire sont encore définies.
		if ( !signInState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( messages( "errors.auth_failed" ), {
				description: messages( "errors.server_error" )
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = signInState;

		if ( reason === "" )
		{
			return;
		}

		// On informe après qu'une réponse a été reçue.
		setLoading( false );

		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			form.reset();

			toast.info( messages( "infos.action_required" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( messages( "errors.auth_failed" ), {
				description: reason
			} );
		}
	}, [ form, messages, signInState ] );

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Fournisseurs d'authentification externes */}
			<form
				action={( formData ) => serverAction( signInAction, formData )}
				onSubmit={() => setLoading( true )}
			>
				<Button
					name="provider"
					value="google"
					variant="outline"
					disabled={
						isLoading
						|| process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== "true"
					}
					className="w-full"
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<svg
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 488 512"
							focusable="false"
							className="mr-2 inline-block h-4 w-4 overflow-visible"
						>
							<path
								d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0
								123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7
								156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
								fill="currentColor"
							/>
						</svg>
					)}
					Google
				</Button>
			</form>

			<form
				action={( formData ) => serverAction( signInAction, formData )}
				onSubmit={() => setLoading( true )}
			>
				<Button
					name="provider"
					value="github"
					variant="outline"
					disabled={
						isLoading
						|| process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED !== "true"
					}
					className="w-full"
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<svg
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 496 512"
							focusable="false"
							className="mr-2 inline-block h-4 w-4 overflow-visible"
						>
							<path
								d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3
								5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2
								2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8
								8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0
								0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9
								20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9
								20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16
								17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4
								17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2
								1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.74.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4
								35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0
								5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
								fill="currentColor"
							/>
						</svg>
					)}
					GitHub
				</Button>
			</form>
		</>
	);
}