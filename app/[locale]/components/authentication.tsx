//
// Composant de la page d'authentification (inscription et connexion).
//

"use client";

import Link from "next/link";
import { z } from "zod";
import schema from "@/schemas/authentication";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Mail, KeyRound } from "lucide-react";

import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "./ui/form";
import { Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider } from "./ui/tooltip";
import { buttonVariants, Button } from "./ui/button";
import { signUpAccount, signInAccount } from "../authentication/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function Authentification()
{
	// Déclaration des variables d'état.
	const [ locked, setLocked ] = useState( false );
	const [ focused, setFocused ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ inputType, setInputType ] = useState( "password" );
	const [ signUpState, signUpAction ] = useFormState( signUpAccount, {
		success: true,
		reason: ""
	} );
	const [ signInState, signInAction ] = useFormState( signInAccount, {
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
		if ( !signUpState || !signInState )
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
		const reason =
			signUpState.reason !== "" ? signUpState.reason : signInState.reason;
		const success = !signUpState.success
			? signUpState.success
			: signInState.success;

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
	}, [ form, signUpState, signInState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Tabs
			className="mb-4 flex w-full flex-col justify-center space-y-6 p-4 text-center sm:mx-auto sm:w-[500px]"
			defaultValue="signUp"
			onValueChange={() => form.reset()}
		>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="signUp">Inscription</TabsTrigger>
				<TabsTrigger value="signIn">Connexion</TabsTrigger>
			</TabsList>

			<TabsContent value="signUp" className="space-y-6">
				{/* Titre et description du formulaire */}
				<h2 className="text-xl font-semibold tracking-tight">
					Création d&lsquo;un compte
				</h2>

				<p className="text-sm text-muted-foreground">
					Saisissez votre adresse électronique pour créer un nouveau
					compte utilisateur. Vous recevrez un lien d&lsquo;activation
					pour valider votre compte et saisir un mot de passe.
				</p>

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
											type="email"
											disabled={loading}
											maxLength={
												schema.shape.email
													.maxLength as number
											}
											spellCheck="false"
											placeholder="example@domain.com"
											autoComplete="email"
											autoCapitalize="off"
										/>
									</FormControl>

									<FormDescription className="sr-only">
										L&lsquo;adresse électronique associée à
										votre compte.
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire */}
						<Button disabled={loading}>
							{loading ? (
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
			</TabsContent>

			<TabsContent value="signIn" className="space-y-6">
				{/* Titre et description du formulaire */}
				<h2 className="text-xl font-semibold tracking-tight">
					Connexion à un compte
				</h2>

				<p className="text-sm text-muted-foreground">
					Saisissez votre adresse électronique pour vous connecter à
					l&lsquo;aide d&lsquo;un lien d&lsquo;authentification. Si
					vous avez associé un mot de passe à votre compte, vous
					pouvez également le saisir pour vous connecter directement.
				</p>

				<Form {...form}>
					<form
						action={( formData ) => serverAction( signInAction, formData )}
						onSubmit={() => setLoading( true )}
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
											type="email"
											disabled={loading}
											maxLength={
												schema.shape.email
													.maxLength as number
											}
											spellCheck="false"
											placeholder="example@domain.com"
											autoComplete="email"
											autoCapitalize="off"
										/>
									</FormControl>

									<FormDescription className="sr-only">
										L&lsquo;adresse électronique associée à
										votre compte.
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
										Mot de passe
									</FormLabel>

									<TooltipProvider>
										<FormControl>
											<Input
												{...field}
												type={inputType}
												onBlur={() => setFocused(
													field.value?.length > 0
												)}
												onKeyUp={( event ) => setLocked(
													event.getModifierState(
														"CapsLock"
													)
												)}
												onFocus={() => setFocused( true )}
												disabled={loading}
												className={`!mt-0 transition-opacity ${
													!focused ? "opacity-25" : ""
												}`}
												maxLength={
													schema.shape.password._def
														.options[ 0 ]
														.maxLength as number
												}
												spellCheck="false"
												placeholder="password"
												autoComplete="current-password"
												autoCapitalize="off"
											/>
										</FormControl>

										<Tooltip>
											<TooltipTrigger
												type="button"
												className={merge(
													`transition-opacity ${
														!focused && "opacity-25"
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
												Voir ou masquer le mot de passe
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<FormDescription className="sr-only">
										Le mot de passe utilisé pour vous
										connecter à votre compte.
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Avertissements pour les majuscules */}
						{locked && (
							<p className="text-sm font-bold uppercase text-destructive">
								Les majuscules ont été activées pour la saisie
								du mot de passe.
							</p>
						)}

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
											disabled={loading}
											onCheckedChange={field.onChange}
										/>
									</FormControl>

									<FormLabel className="!mt-0">
										Se souvenir de moi
									</FormLabel>

									<FormDescription className="sr-only">
										Pour rester connecté à votre compte
										lorsque vous revenez sur le site.
									</FormDescription>
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire */}
						<Button disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Traitement...
								</>
							) : (
								( form.getValues( "password" ) === "" && (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Connexion par courriel
									</>
								) ) || (
									<>
										<KeyRound className="mr-2 h-4 w-4" />
										Connexion par mot de passe
									</>
								)
							)}
						</Button>
					</form>
				</Form>
			</TabsContent>

			{/* Barre verticale de séparation */}
			<div className="flex items-center space-x-2">
				<Separator className="w-auto flex-grow" />

				<p className="text-xs uppercase text-muted-foreground">
					Ou continuer avec
				</p>

				<Separator className="w-auto flex-grow" />
			</div>

			{/* Fournisseurs d'authentification externes */}
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
			>
				<input type="hidden" name="provider" value="google" />

				<Button
					type="submit"
					variant="outline"
					disabled={
						loading
						|| process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== "true"
					}
					className="w-full"
				>
					{loading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<FontAwesomeIcon
							icon={faGoogle}
							className="mr-2 h-4 w-4"
						/>
					)}
					Google
				</Button>
			</form>

			<form
				action={( formData ) => serverAction( signInAction, formData )}
				onSubmit={() => setLoading( true )}
			>
				<input type="hidden" name="provider" value="github" />

				<Button
					type="submit"
					variant="outline"
					disabled={
						loading
						|| process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED !== "true"
					}
					className="w-full"
				>
					{loading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<FontAwesomeIcon
							icon={faGithub}
							className="mr-2 h-4 w-4"
						/>
					)}
					GitHub
				</Button>
			</form>

			<p className="px-8 text-center text-sm text-muted-foreground">
				En continuant, vous acceptez nos{" "}
				<Link
					href="/legal/terms"
					target="_blank"
					className="underline decoration-dotted underline-offset-4 dark:hover:text-primary-foreground"
				>
					conditions d&lsquo;utilisation
				</Link>{" "}
				et notre{" "}
				<Link
					href="/legal/privacy"
					target="_blank"
					className="underline decoration-dotted underline-offset-4 dark:hover:text-primary-foreground"
				>
					politique de confidentialité
				</Link>
				.
			</p>
		</Tabs>
	);
}