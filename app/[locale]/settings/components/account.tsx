//
// Composant de paramétrage du compte utilisateur.
//

"use client";

import schema from "@/schemas/account";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect } from "react";
import { Languages, Lock, Contact, Loader2, RefreshCw } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import { Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider } from "../../components/ui/tooltip";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { updateAccount } from "../account/actions";
import { Button, buttonVariants } from "../../components/ui/button";

// Déclaration des langues disponibles.
const languages = [
	{ label: "Anglais", value: "en" },
	{ label: "Français", value: "fr" }
] as const;

export default function Account( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const { toast } = useToast();
	const formState = {
		success: true,
		reason: ""
	};

	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateAccount, formState );
	const [ passwordType, setPasswordType ] = useState( "text" );

	// Déclaration des constantes.
	const locale = useLocale();
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			username: session.user?.name ?? "",
			language: locale,
			password: ""
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

	// Affichage des erreurs en provenance du serveur.
	useEffect( () =>
	{
		// On récupère d'abord une possible raison d'échec
		//  ainsi que l'état associé.
		const { success, reason } = updateState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après une partie du formulaire
		//  en cas de succès.
		if ( success )
		{
			form.resetField( "password" );
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			toast( {
				title: success ? "Action nécessaire" : "Mise à jour échouée",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ toast, form, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={updateAction}
				onSubmit={() => setLoading( true )}
				className="space-y-8"
			>
				{/* Nom d'affichage */}
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
									minLength={
										schema.shape.username
											.minLength as number
									}
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

				{/* Mot de passe */}
				<FormField
					name="password"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<Lock className="mr-2 inline h-6 w-6" />
								Mot de passe
							</FormLabel>

							<FormControl
								className={session.user.oauth ? "hidden" : ""}
							>
								<div className="flex gap-2">
									<TooltipProvider>
										<Input
											{...field}
											type={passwordType}
											onKeyDown={() => setPasswordType( "password" )}
											minLength={
												schema.shape.password._def
													.options[ 0 ]
													.minLength as number
											}
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

							{session.user.oauth ? (
								<FormDescription className="font-extrabold text-destructive">
									Ce paramètre ne peut pas être modifié en
									raison de l&lsquo;utilisation d&lsquo;un
									fournisseur d&lsquo;authentification externe
									pour vous connecter au site.
								</FormDescription>
							) : (
								<FormDescription>
									Ceci est le mot de passe qui sera utilisé
									pour vous connecter à votre compte si vous
									ne souhaitez pas utiliser les liens
									d&lsquo;authentification envoyés par
									courriel.
								</FormDescription>
							)}

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