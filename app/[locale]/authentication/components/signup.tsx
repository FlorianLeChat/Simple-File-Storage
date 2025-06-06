//
// Composant d'inscription pour le formulaire d'authentification.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/server-action";
import { Mail, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect, useActionState } from "react";

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
	// Déclaration du formulaire.
	const form = useForm<v.InferOutput<typeof schema>>( {
		resolver: valibotResolver( schema ),
		defaultValues: {
			email: "",
			password: ""
		}
	} );

	// Méthode passerelle pour l'inscription des utilisateurs.
	const proxySignUpUser = async ( lastState: Record<string, unknown>, formData: FormData ) =>
	{
		const state = await form.trigger();

		if ( !state )
		{
			return;
		}

		return serverAction( signUpAccount, lastState, formData );
	};

	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ signUpState, signUpAction, isPending ] = useActionState( proxySignUpUser, {
		success: true,
		reason: ""
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
			toast.error( messages( "errors.auth_failed" ), {
				description: messages( "errors.server_error" )
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
	}, [ form, messages, signUpState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form action={signUpAction} className="space-y-6">
				{/* Adresse électronique */}
				<FormField
					name="email"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel className="sr-only">
								{messages( "fields.email_label" )}
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isPending}
									maxLength={
										schema.entries.email.pipe[ 2 ].requirement
									}
									spellCheck="false"
									placeholder={messages(
										"fields.email_placeholder"
									)}
									autoComplete="email"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription className="sr-only">
								{messages( "fields.email_description_short" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							{messages( "loading" )}
						</>
					) : (
						<>
							<Mail className="mr-2 size-4" />
							{messages( "register" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}