//
// Composant de paramétrage des informations utilisateur.
//

"use client";

import Image from "next/image";
import * as z from "zod";
import schema from "@/schemas/user";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { Lock,
	Check,
	AtSign,
	Contact,
	Loader2,
	RefreshCw,
	FileImage,
	Languages,
	Smartphone,
	ClipboardCopy } from "lucide-react";
import serverAction from "@/utilities/recaptcha";
import { useLocale } from "next-intl";
import { formatSize } from "@/utilities/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect } from "react";

import { Input } from "../../components/ui/input";
import { InputOTP,
	InputOTPSlot,
	InputOTPGroup } from "../../components/ui/input-otp";
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
import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { Button, buttonVariants } from "../../components/ui/button";
import { updateUser, validateOTP } from "../user/actions";

// Déclaration des langues disponibles.
const languages = [
	{ label: "Anglais", value: "en" },
	{ label: "Français", value: "fr" }
] as const;

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
	const [ showOTP, setShowOTP ] = useState( false );
	const [ isLocked, setLocked ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ backupCode, setBackupCode ] = useState( "" );
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

	// Soumission de la requête de validation de la double authentification.
	const submitOTPValidation = async ( code: string ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Récupération des données du formulaire.
		const formData = new FormData();
		formData.set( "secret", secret );
		formData.set( "code", code );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const state = await serverAction( validateOTP, formData );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state !== false && state !== "" )
		{
			// Fermeture de la boîte de dialogue courante.
			setShowOTP( false );

			// Ouverture de la boîte de dialogue pour le
			//  code de secours.
			setBackupCode( state as string );

			// Envoi d'une notification de succès.
			toast.success( "form.info.action_success", {
				description: "form.info.otp_enabled"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
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
										<Button
											type="button"
											variant="link"
											onClick={() => setShowOTP( true )}
											className="h-auto p-0 text-muted-foreground underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
										>
											Activation de
											l&lsquo;authentification à deux
											facteurs
										</Button>
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

				{/* Procédure de validation de la double authentification */}
				<Dialog open={showOTP} onOpenChange={setShowOTP}>
					<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
						<DialogHeader>
							<DialogTitle className="flex items-center">
								<Smartphone className="mr-2 inline h-5 w-5" />
								Authentification à deux facteurs
							</DialogTitle>

							<Image
								src={image}
								alt="QR Code"
								width={164}
								height={164}
								className="!mb-2 !mt-4"
							/>

							<DialogDescription className="text-left">
								Afin de sécuriser davantage votre compte, vous
								pouvez activer l&lsquo;authentification à deux
								facteurs.
								<br />
								<br />
								1. Tout d&lsquo;abord, vous devez scanner le
								code QR ci-dessus avec une application
								compatible comme{" "}
								<a
									rel="noopener noreferrer"
									href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
									target="_blank"
									className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
								>
									Google Authenticator
								</a>{" "}
								ou{" "}
								<a
									rel="noopener noreferrer"
									href="https://play.google.com/store/apps/details?id=com.authy.authy"
									target="_blank"
									className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
								>
									Authy
								</a>
								.
								<br />
								<br />
								2. Une fois activée, veuillez saisir ci-dessous
								le code de sécurité généré par votre application
								pour valider la double authentification.
								<br />
								<br />
								3. Lorsque la double authentification est
								validée, vous serez invité à sauvegarder un code
								de secours pour désactiver la double
								authentification si vous perdez votre téléphone.
							</DialogDescription>
						</DialogHeader>

						<form
							id="validate-otp-form"
							onSubmit={( event ) =>
							{
								// Arrêt du comportement par défaut.
								event.preventDefault();

								// Récupération de la valeur du champ de saisie.
								const element = event.currentTarget.children[ 0 ]
									.children[ 1 ] as HTMLInputElement;

								submitOTPValidation( element.value );
							}}
						>
							<InputOTP
								name="code"
								render={( { slots } ) => (
									<InputOTPGroup>
										{slots.map( ( slot, index ) => (
											<InputOTPSlot
												{...slot}
												key={index}
											/>
										) )}
									</InputOTPGroup>
								)}
								maxLength={6}
							/>
						</form>

						<Button
							type="submit"
							form="validate-otp-form"
							disabled={isLoading}
							className="w-full"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Veuillez patienter...
								</>
							) : (
								<>
									<Check className="mr-2 h-4 w-4" />
									Activer l&lsquo;authentification à deux
									facteurs
								</>
							)}
						</Button>
					</DialogContent>
				</Dialog>

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
										render={( { slots } ) => (
											<InputOTPGroup>
												{slots.map( ( slot, index ) => (
													<InputOTPSlot
														key={index}
														{...slot}
													/>
												) )}
											</InputOTPGroup>
										)}
										maxLength={6}
									/>
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

				{/* Code de secours */}
				<Dialog open={backupCode !== ""}>
					<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
						<DialogHeader>
							<DialogTitle className="flex items-center">
								<Smartphone className="mr-2 inline h-5 w-5" />
								Code de secours
							</DialogTitle>

							<DialogDescription className="text-left">
								Votre compte est désormais protégé par
								l&lsquo;authentification à deux facteurs.
								Ci-dessous se trouve un code de secours que vous
								pouvez utiliser afin de désactiver
								l&lsquo;authentification à deux facteurs si vous
								perdez votre téléphone.{" "}
								<strong>
									Si vous perdez ce code, vous devrez
									contacter le support technique mais votre
									demande pourra être refusée en cas de
									négligence constatée.
								</strong>
								<br />
								<br />
								<code>{backupCode}</code>
							</DialogDescription>
						</DialogHeader>

						<DialogClose
							onClick={() =>
							{
								// Copie dans le presse-papiers.
								navigator.clipboard.writeText( backupCode );

								// Réinitialisation du code de secours.
								setBackupCode( "" );
							}}
							className={merge( buttonVariants(), "w-full" )}
						>
							<ClipboardCopy className="mr-2 h-4 w-4" />
							Copier dans le presse-papiers
						</DialogClose>
					</DialogContent>
				</Dialog>

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
									{languages.map( ( language ) => (
										<SelectItem
											key={language.value}
											value={language.value}
										>
											{language.label}
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