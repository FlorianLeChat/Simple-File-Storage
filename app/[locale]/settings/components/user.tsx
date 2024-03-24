//
// Composant de paramétrage des informations utilisateur.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/user";
import { toast } from "sonner";
import { Lock,
	AtSign,
	Contact,
	Loader2,
	RefreshCw,
	FileImage,
	Languages,
	Smartphone } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { formatSize } from "@/utilities/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
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
import { InputOTP,
	InputOTPSlot,
	InputOTPGroup,
	InputOTPSeparator } from "../../components/ui/input-otp";
import OTPValidationModal from "./otp-validation";
import { Button, buttonVariants } from "../../components/ui/button";

export default function User( {
	image,
	secret,
	session
}: {
	image: string;
	secret: string;
	session: Session;
} )
{
	// Déclaration des variables d'état.
	const t = useTranslations( "form" );
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
	const userSchema = schema.omit( { avatar: true } ).extend( {
		// Modification de la vérification de l'avatar pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		avatar: z.string().optional()
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof userSchema>>( {
		resolver: zodResolver( userSchema ),
		defaultValues: {
			username: session.user.name ?? "",
			email: session.user.email ?? "",
			password: "",
			otp: "",
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

			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
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

			toast.success( "form.info.update_success", {
				description: reason
			} );
		}
		else
		{
			toast.error( "form.errors.update_failed", {
				description: reason
			} );
		}
	}, [ form, updateState ] );

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
					return serverAction( updateAction, formData );
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
								<Contact className="mr-2 inline h-6 w-6" />
								Nom d&lsquo;utilisateur
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									maxLength={
										schema.shape.username
											.maxLength as number
									}
									spellCheck="false"
									placeholder="John Doe"
									autoComplete="name"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								Ceci est le nom d&lsquo;utilisateur qui sera
								affiché publiquement sur votre profil et dans la
								recherche d&lsquo;utilisateurs pour partager des
								fichiers. Cela peut être votre nom complet ou un
								simple pseudonyme.
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
									<AtSign className="mr-2 inline h-6 w-6" />
									Adresse électronique
								</FormLabel>

								<FormControl>
									<Input
										{...field}
										disabled={isLoading}
										maxLength={
											schema.shape.email
												.maxLength as number
										}
										spellCheck="false"
										placeholder="name@example.com"
										autoComplete="email"
										autoCapitalize="off"
									/>
								</FormControl>

								<FormDescription>
									Ceci est l&lsquo;adresse électronique
									associée à votre compte. Elle est
									indispensable pour vous connecter à votre
									compte et recevoir les notifications via
									courriel.
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Mot de passe */}
				{!session.user.oauth && (
					<FormField
						name="password"
						control={form.control}
						render={( { field } ) => (
							<FormItem>
								<FormLabel>
									<Lock className="mr-2 inline h-6 w-6" />
									Mot de passe
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
												schema.shape.password._def
													.options[ 0 ]
													.maxLength as number
											}
											className="inline-block w-[calc(100%-40px-0.5rem)]"
											spellCheck="false"
											placeholder="password"
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
											<RefreshCw className="h-4 w-4" />
										</TooltipTrigger>

										<TooltipContent>
											Générer un mot de passe sécurisé
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<FormDescription>
									Ceci est le mot de passe qui sera utilisé
									pour vous connecter à votre compte si vous
									ne souhaitez pas utiliser les liens
									d&lsquo;authentification envoyés par
									courriel.{" "}
									{!session.user.otp && (
										<OTPValidationModal
											image={image}
											secret={secret}
										/>
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
						Les majuscules ont été activées pour la saisie du mot de
						passe.
					</p>
				)}

				{/* Authentification à deux facteurs */}
				{session.user.otp && (
					<FormField
						name="otp"
						control={form.control}
						render={( { field } ) => (
							<FormItem className="flex flex-col">
								<FormLabel>
									<Smartphone className="mr-2 inline h-6 w-6" />
									Authentification à deux facteurs
								</FormLabel>

								<FormControl>
									<InputOTP
										{...field}
										maxLength={6}
										className="!w-auto"
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

								<FormDescription>
									Vous pouvez désactiver
									l&lsquo;authentification à deux facteurs en
									saisissant un code provenant de votre
									application.{" "}
									<strong>
										Si vous avez perdu votre téléphone,
										veuillez utiliser le code de secours
										fourni lors de l&lsquo;activation.
									</strong>
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Langue préférée */}
				<FormField
					name="language"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<Languages className="mr-2 inline h-6 w-6" />
								Langue préférée
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
											{t(
												`fields.language_label_${ language }`
											)}
										</SelectItem>
									) )}
								</SelectContent>
							</Select>

							<FormDescription>
								Ceci est la langue qui sera utilisée sur
								l&lsquo;ensemble des pages du site. Si votre
								langue comporte des traductions incomplètes,
								nous utiliserons la langue par défaut du site
								pour les compléter.
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
								<FileImage className="mr-2 inline h-6 w-6" />
								Avatar
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
								Vous pouvez mettre à jour l&lsquo;avatar utilisé
								pour votre compte utilisateur.{" "}
								<strong suppressHydrationWarning>
									Les avatars ne doivent pas dépasser{" "}
									{formatSize( maxAvatarSize )} et doivent être
									au format PNG, JPEG ou WEBP.
								</strong>
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Mise à jour...
						</>
					) : (
						<>
							<RefreshCw className="mr-2 h-4 w-4" />
							Mettre à jour
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}