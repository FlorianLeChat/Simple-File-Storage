//
// Composant de connexion pour le formulaire d'authentification.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useTranslations } from "next-intl";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Eye, Mail, EyeOff, Loader2, KeyRound } from "lucide-react";
import { useState, useEffect, useActionState, startTransition } from "react";

import { Input } from "../../components/ui/input";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider } from "../../components/ui/tooltip";
import { signInAccount } from "../actions/signin";
import { buttonVariants, Button } from "../../components/ui/button";

export default function SignInForm()
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isLocked, setLocked ] = useState( false );
	const [ isFocused, setFocused ] = useState( false );
	const [ inputType, setInputType ] = useState( "password" );
	const [ signInState, signInAction, isPending ] = useActionState( signInAccount, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<v.InferOutput<typeof schema>>( {
		resolver: valibotResolver( schema ),
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
		<Form {...form}>
			<form
				action={async ( formData: FormData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return;
					}

					// Exécution de l'action côté serveur.
					startTransition( () =>
					{
						serverAction( signInAction, formData );
					} );
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

				{/* Mot de passe */}
				<FormField
					name="password"
					control={form.control}
					render={( { field } ) => (
						<FormItem className={process.env.NEXT_PUBLIC_ENV === "production" ? "hidden" : ""}>
							<FormLabel className="sr-only">
								{messages( "fields.password_label" )}
							</FormLabel>

							<TooltipProvider>
								<FormControl>
									<Input
										{...field}
										type={inputType}
										onBlur={() => setFocused( field.value?.length > 0 )}
										onKeyUp={( event ) => setLocked(
											event.getModifierState(
												"CapsLock"
											)
										)}
										onFocus={() => setFocused( true )}
										disabled={isPending}
										className={`!mt-0 mr-2 inline-block w-[calc(100%-40px-0.5rem)] transition-opacity ${
											!isFocused ? "opacity-50" : ""
										}`}
										maxLength={
											schema.entries.password.options[ 0 ]
												.pipe[ 2 ].requirement
										}
										spellCheck="false"
										placeholder={messages(
											"fields.password_placeholder"
										)}
										autoComplete="current-password"
										autoCapitalize="off"
									/>
								</FormControl>

								<Tooltip>
									<TooltipTrigger
										type="button"
										className={merge(
											`!mt-0 align-bottom transition-opacity ${
												!isFocused && "opacity-50"
											}`,
											buttonVariants( {
												size: "icon",
												variant: "outline"
											} )
										)}
										onClick={() =>
										{
											setInputType(
												inputType === "password"
													? "text"
													: "password"
											);
										}}
									>
										{inputType === "password" ? (
											<Eye className="size-4" />
										) : (
											<EyeOff className="size-4" />
										)}
									</TooltipTrigger>

									<TooltipContent>
										{messages( "fields.password_tooltip" )}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<FormDescription className="sr-only">
								{messages( "fields.password_description_short" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Avertissements pour les majuscules */}
				{isLocked && (
					<p className="text-sm font-bold uppercase text-destructive">
						{messages( "fields.password_capslock" )}
					</p>
				)}

				{/* Bouton de validation du formulaire */}
				<Button disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							{messages( "loading" )}
						</>
					) : (
						( form.getValues( "password" ) === "" && (
							<>
								<Mail className="mr-2 size-4" />
								{messages( "log_by_email" )}
							</>
						) ) || (
							<>
								<KeyRound className="mr-2 size-4" />
								{messages( "log_by_password" )}
							</>
						)
					)}
				</Button>
			</form>
		</Form>
	);
}