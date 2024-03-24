//
// Composant de connexion pour le formulaire d'authentification.
//

"use client";

import { z } from "zod";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Eye, Mail, EyeOff, Loader2, KeyRound } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
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
import { InputOTP,
	InputOTPSlot,
	InputOTPGroup,
	InputOTPSeparator } from "../../components/ui/input-otp";
import { signInAccount } from "../actions/signin";
import { buttonVariants, Button } from "../../components/ui/button";

export default function SignInForm()
{
	// Déclaration des variables d'état.
	const t = useTranslations( "form" );
	const [ isLocked, setLocked ] = useState( false );
	const [ isFocused, setFocused ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ inputType, setInputType ] = useState( "password" );
	const [ signInState, signInAction ] = useFormState( signInAccount, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			otp: "",
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
		if ( !signInState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( t( "errors.auth_failed" ), {
				description: t( "errors.server_error" )
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

			toast.info( t( "infos.action_required" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( t( "errors.auth_failed" ), {
				description: reason
			} );
		}
	}, [ t, form, signInState ] );

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
					return serverAction( signInAction, formData );
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
								{t( "fields.email_label" )}
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									maxLength={
										schema.shape.email.maxLength as number
									}
									spellCheck="false"
									placeholder={t( "fields.email_placeholder" )}
									autoComplete="email"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription className="sr-only">
								{t( "fields.email_description" )}
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
						<FormItem className="flex gap-2">
							<FormLabel className="sr-only">
								{t( "fields.password_label" )}
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
										disabled={isLoading}
										className={`!mt-0 transition-opacity ${
											!isFocused ? "opacity-25" : ""
										}`}
										maxLength={
											schema.shape.password._def
												.options[ 0 ].maxLength as number
										}
										spellCheck="false"
										placeholder={t(
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
											`!mt-0 transition-opacity ${
												!isFocused && "opacity-25"
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
											<Eye className="h-4 w-4" />
										) : (
											<EyeOff className="h-4 w-4" />
										)}
									</TooltipTrigger>

									<TooltipContent>
										{t( "fields.password_tooltip" )}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<FormDescription className="sr-only">
								{t( "fields.password_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Avertissements pour les majuscules */}
				{isLocked && (
					<p className="text-sm font-bold uppercase text-destructive">
						{t( "fields.password_capslock" )}
					</p>
				)}

				{/* Validation de l'authentification à deux facteurs */}
				<FormField
					name="otp"
					control={form.control}
					render={( { field } ) => (
						<FormItem
							className={`!mt-4 flex flex-col items-center transition-opacity ${
								!isFocused ? "opacity-25" : ""
							}`}
						>
							<FormLabel className="sr-only">
								{t( "fields.otp_label" )}
							</FormLabel>

							<FormControl>
								<InputOTP
									{...field}
									onBlur={() => setFocused( field.value?.length > 0 )}
									onFocus={() => setFocused( true )}
									maxLength={6}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
									</InputOTPGroup>

									<InputOTPSeparator />

									<InputOTPGroup>
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</FormControl>

							<FormDescription
								className={`transition-opacity ${
									!isFocused ? "opacity-25" : ""
								}`}
							>
								{t( "fields.otp_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Se souvenir de moi */}
				<FormField
					name="remembered"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="flex items-center justify-center space-x-2">
							<FormControl>
								<Switch
									name="remembered"
									checked={field.value}
									disabled={isLoading}
									onCheckedChange={field.onChange}
								/>
							</FormControl>

							<FormLabel className="!mt-0">
								{t( "fields.remembered_label" )}
							</FormLabel>

							<FormDescription className="sr-only">
								{t( "fields.remembered_description" )}
							</FormDescription>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{t( "loading" )}
						</>
					) : (
						( form.getValues( "password" ) === "" && (
							<>
								<Mail className="mr-2 h-4 w-4" />
								{t( "log_by_email" )}
							</>
						) ) || (
							<>
								<KeyRound className="mr-2 h-4 w-4" />
								{t( "log_by_password" )}
							</>
						)
					)}
				</Button>
			</form>
		</Form>
	);
}