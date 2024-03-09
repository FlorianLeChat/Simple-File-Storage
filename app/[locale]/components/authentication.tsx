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
import { Eye,
	Mail,
	Check,
	EyeOff,
	Loader2,
	KeyRound,
	ShieldQuestion } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useState, useEffect } from "react";

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
import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription } from "./ui/dialog";
import { buttonVariants, Button } from "./ui/button";
import { signUpAccount, signInAccount } from "../authentication/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function Authentification()
{
	// Déclaration des variables d'état.
	const [ isLocked, setLocked ] = useState( false );
	const [ isFocused, setFocused ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ showReset, setShowReset ] = useState( false );
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
											disabled={isLoading}
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
					pouvez également le saisir pour vous connecter directement.{" "}
					<Button
						type="button"
						variant="link"
						onClick={() => setShowReset( true )}
						className="h-auto p-0 text-muted-foreground underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
					>
						Vous avez oublié votre mot de passe ?
					</Button>
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
												disabled={isLoading}
												className={`!mt-0 transition-opacity ${
													!isFocused
														? "opacity-25"
														: ""
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
													`!mt-0 transition-opacity ${
														!isFocused
														&& "opacity-25"
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
						{isLocked && (
							<p className="text-sm font-bold uppercase text-destructive">
								Les majuscules ont été activées pour la saisie
								du mot de passe.
							</p>
						)}

						{/* Procédure en cas d'oubli du mot de passe */}
						<Dialog open={showReset} onOpenChange={setShowReset}>
							<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
								<DialogHeader>
									<DialogTitle className="flex items-center">
										<ShieldQuestion className="mr-2 inline h-5 w-5" />
										Oubli du mot de passe
									</DialogTitle>

									<DialogDescription className="text-left">
										Si vous avez oublié votre mot de passe,
										essayez de vous connecter à votre compte
										avec un lien d&lsquo;authentification à
										usage unique envoyé à votre adresse
										électronique. Une fois connecté, vous
										pourrez saisir un nouveau mot de passe
										pour votre compte.
										<br />
										<strong className="mt-1 inline-block">
											En cas de perte de l&lsquo;accès à
											votre adresse électronique, vous
											devrez recréer un nouveau compte car
											le support technique ne sera pas
											légalement autorisé à vous aider à
											récupérer l&lsquo;accès à votre
											compte.
										</strong>
									</DialogDescription>
								</DialogHeader>

								<DialogClose
									className={merge(
										buttonVariants(),
										"w-full"
									)}
								>
									<Check className="mr-2 h-4 w-4" />
									J&lsquo;ai bien compris
								</DialogClose>
							</DialogContent>
						</Dialog>

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
						<Button disabled={isLoading}>
							{isLoading ? (
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
				action={( formData ) => serverAction( signInAction, formData )}
				onSubmit={() => setLoading( true )}
			>
				<Button
					name="provider"
					value="google"
					variant="outline"
					disabled={
						isLoading
						|| process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== "true"
					}
					className="w-full"
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<svg
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 488 512"
							focusable="false"
							className="mr-2 inline-block h-4 w-4 overflow-visible"
						>
							<path
								d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0
								123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7
								156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
								fill="currentColor"
							/>
						</svg>
					)}
					Google
				</Button>
			</form>

			<form
				action={( formData ) => serverAction( signInAction, formData )}
				onSubmit={() => setLoading( true )}
			>
				<Button
					name="provider"
					value="github"
					variant="outline"
					disabled={
						isLoading
						|| process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED !== "true"
					}
					className="w-full"
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<svg
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 496 512"
							focusable="false"
							className="mr-2 inline-block h-4 w-4 overflow-visible"
						>
							<path
								d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3
								5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2
								2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8
								8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0
								0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9
								20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9
								20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16
								17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4
								17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2
								1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.74.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4
								35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0
								5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
								fill="currentColor"
							/>
						</svg>
					)}
					GitHub
				</Button>
			</form>

			<p className="px-8 text-center text-sm text-muted-foreground">
				En continuant, vous acceptez nos{" "}
				<Link
					href="/legal/terms"
					target="_blank"
					className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
				>
					conditions d&lsquo;utilisation
				</Link>{" "}
				et notre{" "}
				<Link
					href="/legal/privacy"
					target="_blank"
					className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
				>
					politique de confidentialité
				</Link>
				.
			</p>
		</Tabs>
	);
}