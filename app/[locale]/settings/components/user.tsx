//
// Composant de paramétrage des informations utilisateur.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/user";
import { toast } from "sonner";
import { Lock,
	AtSign,
	Contact,
	Loader2,
	RefreshCw,
	FileImage,
	Languages } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { formatSize } from "@/utilities/react-table";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Input } from "../../components/ui/input";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
import { Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider } from "../../components/ui/tooltip";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { updateUser } from "../actions/update-user";
import { Button, buttonVariants } from "../../components/ui/button";

export default function User( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isLocked, setLocked ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateUser, {
		success: true,
		reason: ""
	} );
	const [ passwordType, setPasswordType ] = useState( "text" );

	// Déclaration des constantes.
	const maxAvatarSize = Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE ?? 0 );
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
	const userSchema = v.object( {
		// Modification de la vérification de l'avatar pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		...v.omit( schema, [ "avatar" ] ).entries,
		...v.object( { avatar: v.optional( v.string() ) } ).entries
	} );

	// Déclaration du formulaire.
	const form = useForm<v.InferOutput<typeof userSchema>>( {
		resolver: valibotResolver( userSchema ),
		defaultValues: {
			username: session.user.name ?? "",
			email: session.user.email ?? "",
			password: "",
			language: useLocale() as "en" | "fr",
			avatar: ""
		}
	} );

	// Génère un mot de passe aléatoire.
	const generateRandomPassword = ( length: number = 15 ) =>
	{
		// On génère d'abord aléatoirement des octets sécurisés.
		const values = new Uint8Array( length );
		crypto.getRandomValues( values );

		// On affiche le mot de passe en clair pour l'utilisateur.
		setPasswordType( "text" );

		// On parcourt enfin les octets générés pour les convertir
		//  en caractères sécurisés.
		return values.reduce(
			( previous, current ) => previous + characters[ current % characters.length ],
			""
		);
	};

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !updateState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( messages( "infos.action_failed" ), {
				description: messages( "errors.server_error" )
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

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
			form.resetField( "avatar" );

			toast.success( messages( "infos.action_success" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( messages( "infos.action_failed" ), {
				description: reason
			} );
		}
	}, [ form, messages, updateState ] );

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

					// Activation de l'état de chargement.
					setLoading( true );

					// Exécution de l'action côté serveur.
					serverAction( updateAction, formData );
				}}
				className="space-y-8"
			>
				{/* Nom d'utilisateur */}
				<FormField
					name="username"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<Contact className="mr-2 inline size-6" />
								{messages( "fields.username_label" )}
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									maxLength={
										schema.entries.username.pipe[ 2 ]
											.requirement
									}
									spellCheck="false"
									placeholder={messages(
										"fields.username_placeholder"
									)}
									autoComplete="name"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								{messages( "fields.username_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Adresse électronique */}
				{!session.user.oauth && (
					<FormField
						name="email"
						control={form.control}
						render={( { field } ) => (
							<FormItem>
								<FormLabel>
									<AtSign className="mr-2 inline size-6" />
									{messages( "fields.email_label" )}
								</FormLabel>

								<FormControl>
									<Input
										{...field}
										disabled={isLoading}
										maxLength={
											schema.entries.email.pipe[ 2 ]
												.requirement
										}
										spellCheck="false"
										placeholder={messages(
											"fields.email_placeholder"
										)}
										autoComplete="email"
										autoCapitalize="off"
									/>
								</FormControl>

								<FormDescription>
									{messages( "fields.email_description_long" )}
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Mot de passe */}
				{!session.user.oauth && process.env.NEXT_PUBLIC_ENV !== "production" && (
					<FormField
						name="password"
						control={form.control}
						render={( { field } ) => (
							<FormItem>
								<FormLabel>
									<Lock className="mr-2 inline size-6" />
									{messages( "fields.password_label" )}
								</FormLabel>

								<TooltipProvider>
									<FormControl>
										<Input
											{...field}
											type={passwordType}
											onKeyUp={( event ) => setLocked(
												event.getModifierState(
													"CapsLock"
												)
											)}
											disabled={isLoading}
											onKeyDown={() => setPasswordType( "password" )}
											maxLength={
												schema.entries.password
													.options[ 0 ].pipe[ 2 ]
													.requirement
											}
											className="inline-block w-[calc(100%-40px-0.5rem)]"
											spellCheck="false"
											placeholder={messages(
												"fields.password_placeholder"
											)}
											autoComplete="new-password"
											autoCapitalize="off"
										/>
									</FormControl>

									<Tooltip>
										<TooltipTrigger
											type="button"
											disabled={isLoading}
											className={merge(
												buttonVariants( {
													size: "icon",
													variant: "outline"
												} ),
												"!mt-0 ml-2 align-bottom"
											)}
											onClick={() =>
											{
												// Génération d'un nouveau mot de passe.
												form.setValue(
													"password",
													generateRandomPassword()
												);
											}}
										>
											<RefreshCw className="size-4" />
										</TooltipTrigger>

										<TooltipContent>
											{messages(
												"fields.password_generation"
											)}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<FormDescription>
									{messages(
										"fields.password_description_long"
									)}
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Avertissements pour les majuscules */}
				{isLocked && (
					<p className="!mt-4 text-sm font-bold uppercase text-destructive">
						{messages( "fields.password_capslock" )}
					</p>
				)}

				{/* Langue préférée */}
				<FormField
					name="language"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<Languages className="mr-2 inline size-6" />
								{messages( "fields.language_label" )}
							</FormLabel>

							<Select
								{...field}
								disabled={isLoading}
								defaultValue={field.value}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>

								<SelectContent>
									{[ "en", "fr" ].map( ( language ) => (
										<SelectItem
											key={language}
											value={language}
										>
											{messages(
												`fields.language_label_${ language }`
											)}
										</SelectItem>
									) )}
								</SelectContent>
							</Select>

							<FormDescription>
								{messages( "fields.language_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Avatar */}
				<FormField
					name="avatar"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<FileImage className="mr-2 inline size-6" />
								{messages( "fields.avatar_label" )}
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									type="file"
									accept={
										process.env
											.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES
									}
									disabled={isLoading}
									className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
								/>
							</FormControl>

							<FormDescription>
								{messages.rich( "fields.avatar_description", {
									b: ( chunks ) => (
										<strong suppressHydrationWarning>
											{chunks}
										</strong>
									),
									size: formatSize( maxAvatarSize )
								} )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							{messages( "loading" )}
						</>
					) : (
						<>
							<RefreshCw className="mr-2 size-4" />
							{messages( "update" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}