//
// Composant d'inscription pour le formulaire d'authentification.
//

"use client";

import { z } from "zod";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { signUpAccount } from "../actions/signup";

export default function SignUpForm()
{
	// Déclaration des variables d'état.
	const [ isLoading, setLoading ] = useState( false );
	const [ signUpState, signUpAction ] = useFormState( signUpAccount, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			email: "",
			password: "",
			remembered: false
		}
	} );

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si les deux variables d'état liées aux actions
		//  de formulaire sont encore définies.
		if ( !signUpState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( "form.errors.auth_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = signUpState;

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

			toast.info( "form.info.email_validation", {
				description: reason
			} );
		}
		else
		{
			toast.error( "form.errors.auth_failed", {
				description: reason
			} );
		}
	}, [ form, signUpState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={async ( formData: FormData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return false;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Exécution de l'action côté serveur.
					return serverAction( signUpAction, formData );
				}}
				className="space-y-6"
			>
				{/* Adresse électronique */}
				<FormField
					name="email"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel className="sr-only">
								Adresse électronique
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									maxLength={
										schema.shape.email.maxLength as number
									}
									spellCheck="false"
									placeholder="example@domain.com"
									autoComplete="email"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription className="sr-only">
								L&lsquo;adresse électronique associée à votre
								compte.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Traitement...
						</>
					) : (
						<>
							<Mail className="mr-2 h-4 w-4" />
							Inscription par courriel
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}