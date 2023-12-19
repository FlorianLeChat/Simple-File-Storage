//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import schema from "@/schemas/authentication";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Mail, KeyRound } from "lucide-react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useToast } from "./ui/use-toast";
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
	// Déclaration des constantes.
	const { toast } = useToast();
	const formState = {
		success: true,
		reason: ""
	};

	// Déclaration des variables d'état.
	const [ focused, setFocused ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ signUpState, signUpAction ] = useFormState( signUpAccount, formState );
	const [ signInState, signInAction ] = useFormState( signInAccount, formState );
	const [ passwordType, setPasswordType ] = useState( "password" );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			email: "",
			password: "",
			remembered: false
		}
	} );

	// Affichage des erreurs en provenance du serveur.
	useEffect( () =>
	{
		// On récupère d'abord une possible raison d'échec
		//  ainsi que l'état associé.
		const reason =
			signUpState.reason !== "" ? signUpState.reason : signInState.reason;
		const success = !signUpState.success
			? signUpState.success
			: signInState.success;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après le formulaire après un succès.
		if ( success )
		{
			form.reset();
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			toast( {
				title: success
					? "Action nécessaire"
					: "Authentification échouée",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ toast, form, signUpState, signInState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Tabs
			className="flex w-full flex-col justify-center space-y-6 p-4 text-center sm:mx-auto sm:w-[500px]"
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
						action={signUpAction}
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
											minLength={
												schema.shape.email
													.minLength as number
											}
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
						action={signInAction}
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
											minLength={
												schema.shape.email
													.minLength as number
											}
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
								<FormItem>
									<FormLabel className="sr-only">
										Mot de passe
									</FormLabel>

									<FormControl>
										<div className="flex gap-2">
											<TooltipProvider>
												<Input
													{...field}
													type={passwordType}
													onBlur={() => setFocused(
														field.value
															?.length !== 0
													)}
													onFocus={() => setFocused( true )}
													disabled={loading}
													className={`transition-opacity ${
														!focused && "opacity-25"
													}`}
													minLength={
														schema.shape.password
															._def.options[ 0 ]
															.minLength as number
													}
													maxLength={
														schema.shape.password
															._def.options[ 0 ]
															.maxLength as number
													}
													spellCheck="false"
													placeholder="password"
													autoComplete="current-password"
													autoCapitalize="off"
												/>

												<Tooltip>
													<TooltipTrigger
														type="button"
														className={merge(
															`transition-opacity ${
																!focused
																&& "opacity-25"
															}`,
															buttonVariants( {
																size: "icon",
																variant:
																	"outline"
															} )
														)}
														onClick={() =>
														{
															setPasswordType(
																passwordType
																	=== "password"
																	? "text"
																	: "password"
															);
														}}
													>
														{( passwordType
															=== "password" && (
															<Eye className="h-4 w-4" />
														) ) || (
															<EyeOff className="h-4 w-4" />
														)}
													</TooltipTrigger>

													<TooltipContent>
														Voir ou masquer le mot
														de passe
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</FormControl>

									<FormDescription className="sr-only">
										Le mot de passe utilisé pour vous
										connecter à votre compte.
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Se souvenir de moi */}
						<FormField
							name="remembered"
							control={form.control}
							render={() => (
								<FormItem>
									<FormLabel className="sr-only">
										Se souvenir de moi
									</FormLabel>

									<FormControl>
										<div className="flex items-center justify-center space-x-2">
											<Switch
												id="remember-me"
												disabled={loading}
											/>

											<Label htmlFor="remember-me">
												Se souvenir de moi
											</Label>
										</div>
									</FormControl>

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

				<span className="text-xs uppercase text-muted-foreground">
					Ou continuer avec
				</span>

				<Separator className="w-auto flex-grow" />
			</div>

			{/* Fournisseurs d'authentification externes */}
			<form action={signInAction} onSubmit={() => setLoading( true )}>
				<input type="hidden" name="provider" value="google" />

				<Button
					type="submit"
					variant="outline"
					disabled={loading}
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

			<form action={signInAction} onSubmit={() => setLoading( true )}>
				<input type="hidden" name="provider" value="github" />

				<Button
					type="submit"
					variant="outline"
					disabled={loading}
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
					href="/terms"
					className="underline underline-offset-4 hover:text-primary"
				>
					conditions d&lsquo;utilisation
				</Link>{" "}
				et notre{" "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-primary"
				>
					politique de confidentialité
				</Link>
				.
			</p>
		</Tabs>
	);
}