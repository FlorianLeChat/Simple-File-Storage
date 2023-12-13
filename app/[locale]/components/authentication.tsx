//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import schema from "@/schemas/authentication";
import { merge } from "@/utilities/tailwind";
import { signIn } from "@/utilities/next-auth";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail, RefreshCw, KeyRound } from "lucide-react";

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
import { Button, buttonVariants } from "./ui/button";
import { signUpAccount, signInAccount } from "../authentication/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function Authentification()
{
	// Déclaration des constantes.
	const { toast } = useToast();
	const { pending } = useFormStatus();
	const initialState = {
		success: true,
		reason: ""
	};
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration des variables d'état.
	const [ focused, setFocused ] = useState( false );
	const [ signUpState, signUpAction ] = useFormState(
		signUpAccount,
		initialState
	);
	const [ signInState, signInAction ] = useFormState(
		signInAccount,
		initialState
	);
	const [ passwordType, setPasswordType ] = useState( "text" );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			email: "",
			password: "",
			remembered: false
		}
	} );

	// Génère un mot de passe aléatoire.
	const generateRandomPassword = ( length: number = 15 ) =>
	{
		// On génère aléatoirement des octets sécurisés.
		const values = new Uint8Array( length );
		crypto.getRandomValues( values );

		// On indique que le champ de mot de passe est actuellement
		//  en cours de modification.
		setFocused( true );

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
		const reason = signUpState.reason ?? signInState.reason;
		const success = signUpState.success ?? signInState.success;

		if ( reason !== "" )
		{
			toast( {
				title: "Authentification échouée",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ toast, signUpState, signInState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Tabs
			className="flex w-full flex-col justify-center space-y-6 p-4 text-center sm:mx-auto sm:w-[500px]"
			defaultValue="signUp"
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
					Saisissez votre adresse électronique et un mot de passe pour
					créer un nouveau compte.
				</p>

				<Form {...form}>
					<form action={signUpAction} className="space-y-6">
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
											disabled={pending}
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
													id="password"
													type={passwordType}
													onBlur={() => setFocused(
														field.value
															?.length !== 0
													)}
													onFocus={() => setFocused( true )}
													onKeyUp={() => setPasswordType(
														"password"
													)}
													disabled={pending}
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
													autoComplete="new-password"
													autoCapitalize="off"
												/>

												<Tooltip>
													<TooltipTrigger
														type="button"
														disabled={pending}
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
															// Génération d'un nouveau mot de passe.
															form.setValue(
																"password",
																generateRandomPassword()
															);

															// Affichage du mot de passe en clair.
															setPasswordType(
																"text"
															);
														}}
													>
														<RefreshCw className="h-4 w-4" />
													</TooltipTrigger>

													<TooltipContent>
														Générer un mot de passe
														sécurisé
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

						{/* Bouton de validation du formulaire */}
						<Button disabled={pending}>
							{pending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Traitement...
								</>
							) : (
								( form.getValues( "password" ) === "" && (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Inscription par courriel
									</>
								) ) || (
									<>
										<KeyRound className="mr-2 h-4 w-4" />
										Inscription par mot de passe
									</>
								)
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
					Saisissez votre adresse électronique et votre mot de passe
					pour vous connecter à votre compte.
				</p>

				<Form {...form}>
					<form action={signInAction} className="space-y-6">
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
											disabled={pending}
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
										<Input
											{...field}
											id="password"
											type={passwordType}
											onBlur={() => setFocused(
												field.value?.length !== 0
											)}
											onFocus={() => setFocused( true )}
											onKeyUp={() => setPasswordType( "password" )}
											disabled={pending}
											className={`transition-opacity ${
												!focused && "opacity-25"
											}`}
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
												disabled={pending}
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
						<Button disabled={pending}>
							{pending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Traitement...
								</>
							) : (
								( form.getValues( "password" ) === "" && (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Authentification par courriel
									</>
								) ) || (
									<>
										<KeyRound className="mr-2 h-4 w-4" />
										Authentification par mot de passe
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
			<Button
				type="button"
				variant="outline"
				onClick={() => signIn( "google", { callbackUrl: "/dashboard" } )}
				disabled={pending}
			>
				{pending ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
				)}
				Google
			</Button>

			<Button
				type="button"
				variant="outline"
				onClick={() => signIn( "github", { callbackUrl: "/dashboard" } )}
				disabled={pending}
			>
				{pending ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<FontAwesomeIcon icon={faGithub} className="mr-2 h-4 w-4" />
				)}
				GitHub
			</Button>

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