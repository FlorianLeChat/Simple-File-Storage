//
// Composant de paramétrage des informations utilisateur.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/user";
import { Lock,
	AtSign,
	Contact,
	Loader2,
	RefreshCw,
	FileImage,
	Languages } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useLocale } from "next-intl";
import { formatSize } from "@/utilities/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect } from "react";

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
import { updateUser } from "../user/actions";
import { Button, buttonVariants } from "../../components/ui/button";

// Déclaration des langues disponibles.
const languages = [
	{ label: "Anglais", value: "en" },
	{ label: "Français", value: "fr" }
] as const;

export default function User( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
	const userSchema = schema.omit( { avatar: true } ).extend( {
		// Modification de la vérification de l'avatar pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		avatar: z.string().optional()
	} );
	const maxAvatarSize = Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE ?? 0 );

	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateUser, {
		success: true,
		reason: ""
	} );
	const [ passwordType, setPasswordType ] = useState( "text" );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof userSchema>>( {
		resolver: zodResolver( userSchema ),
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

			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère également une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après une partie du formulaire
		//  en cas de succès.
		if ( success )
		{
			form.resetField( "avatar" );
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			if ( success )
			{
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
									disabled={loading}
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
				<FormField
					name="email"
					control={form.control}
					render={( { field } ) => (
						<FormItem
							className={session.user.oauth ? "hidden" : ""}
						>
							<FormLabel htmlFor="email">
								<AtSign className="mr-2 inline h-6 w-6" />
								Adresse électronique
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={loading}
									maxLength={
										schema.shape.email.maxLength as number
									}
									spellCheck="false"
									placeholder="name@example.com"
									autoComplete="email"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								Ceci est l&lsquo;adresse électronique associée à
								votre compte. Elle est indispensable pour vous
								connecter à votre compte et recevoir les
								notifications via courriel.
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
						<FormItem
							className={session.user.oauth ? "hidden" : ""}
						>
							<FormLabel>
								<Lock className="mr-2 inline h-6 w-6" />
								Mot de passe
							</FormLabel>

							<FormControl>
								<div className="flex gap-2">
									<TooltipProvider>
										<Input
											{...field}
											type={passwordType}
											disabled={loading}
											onKeyDown={() => setPasswordType( "password" )}
											maxLength={
												schema.shape.password._def
													.options[ 0 ]
													.maxLength as number
											}
											spellCheck="false"
											placeholder="password"
											autoComplete="new-password"
											autoCapitalize="off"
										/>

										<Tooltip>
											<TooltipTrigger
												type="button"
												disabled={loading}
												className={buttonVariants( {
													size: "icon",
													variant: "outline"
												} )}
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
								</div>
							</FormControl>

							<FormDescription>
								Ceci est le mot de passe qui sera utilisé pour
								vous connecter à votre compte si vous ne
								souhaitez pas utiliser les liens
								d&lsquo;authentification envoyés par courriel.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Langue préférée */}
				<FormField
					name="language"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="flex flex-col">
							<FormLabel htmlFor="language">
								<Languages className="mr-2 inline h-6 w-6" />
								Langue préférée
							</FormLabel>

							<FormControl>
								<Select
									{...field}
									disabled={loading}
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="language"
										aria-controls="language"
									>
										<SelectValue />
									</SelectTrigger>

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
							</FormControl>

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
							<FormLabel htmlFor="email">
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
									disabled={loading}
									className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
								/>
							</FormControl>

							<FormDescription>
								Vous pouvez mettre à jour l&lsquo;avatar utilisé
								pour votre compte utilisateur.{" "}
								<strong>
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
				<Button disabled={loading} className="max-sm:w-full">
					{loading ? (
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