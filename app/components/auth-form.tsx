//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, type FormEvent } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useToast } from "./ui/use-toast";
import { Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "./ui/form";
import { ToastAction } from "./ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Déclaration du schéma de validation du formulaire.
const authSchema = z.object( {
	email: z.string().min( 10 ).max( 100 ).email(),
	password: z.string().min( 10 ).max( 60 ),
	remembered: z.boolean().optional()
} );

export default function AuthForm()
{
	// Déclaration des constantes.
	const { toast } = useToast();
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );
	const [ passwordType, setPasswordType ] = useState( "text" );

	// Requête de création d'un compte utilisateur par courriel.
	const createEmailAccount = ( values: z.infer<typeof authSchema> ) =>
	{
		setIsLoading( true );

		setTimeout( () =>
		{
			toast( {
				title: "Authentification échouée",
				variant: "destructive",
				description:
					"Cette fonctionnalité est actuellement indisponible.",
				action: (
					<ToastAction
						altText="Réessayer"
						onClick={() => createEmailAccount( values )}
					>
						Réessayer
					</ToastAction>
				)
			} );

			setIsLoading( false );
		}, 3000 );
	};

	// Requête de connexion d'un compte utilisateur par protocole OAuth.
	const createOAuthAccount = ( event: FormEvent<HTMLButtonElement> ) =>
	{
		event.preventDefault();
		setIsLoading( true );

		setTimeout( () =>
		{
			toast( {
				title: "Authentification échouée",
				variant: "destructive",
				description:
					"Cette fonctionnalité est actuellement indisponible.",
				action: (
					<ToastAction
						altText="Réessayer"
						onClick={() => createOAuthAccount( event )}
					>
						Réessayer
					</ToastAction>
				)
			} );

			setIsLoading( false );
		}, 3000 );
	};

	// Génère un mot de passe aléatoire.
	const generateRandomPassword = ( length: number = 15 ) =>
	{
		// On génère aléatoirement des octets sécurisés.
		const values = new Uint8Array( length );
		crypto.getRandomValues( values );

		// On parcourt enfin les octets générés pour les convertir
		//  en caractères sécurisés.
		return values.reduce(
			( password, value ) => password + characters[ value % characters.length ],
			""
		);
	};

	// Définition des formulaires.
	const registerForm = useForm<z.infer<typeof authSchema>>( {
		// Inscription.
		resolver: zodResolver( authSchema ),
		defaultValues: {
			email: "",
			password: generateRandomPassword()
		}
	} );

	const loginForm = useForm<z.infer<typeof authSchema>>( {
		// Connexion.
		resolver: zodResolver( authSchema ),
		defaultValues: {
			email: "",
			password: "",
			remembered: false
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<Tabs
			className="flex w-full flex-col justify-center space-y-6 px-4 text-center sm:mx-auto sm:w-[500px]"
			defaultValue="account"
		>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="account">Inscription</TabsTrigger>
				<TabsTrigger value="password">Connexion</TabsTrigger>
			</TabsList>

			<TabsContent value="account" className="space-y-6">
				{/* Titre et description du formulaire */}
				<h2 className="text-xl font-semibold tracking-tight">
					Création d&lsquo;un compte
				</h2>

				<p className="text-sm text-muted-foreground">
					Saisissez votre adresse électronique et un mot de passe pour
					créer un nouveau compte.
				</p>

				<Form {...registerForm}>
					<form
						onSubmit={registerForm.handleSubmit( createEmailAccount )}
						className="space-y-6"
					>
						{/* Adresse électronique */}
						<FormField
							name="email"
							control={registerForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel className="sr-only">
										Adresse électronique
									</FormLabel>

									<FormControl>
										<Input
											{...field}
											type="email"
											disabled={isLoading}
											minLength={
												authSchema.shape.email
													.minLength as number
											}
											maxLength={
												authSchema.shape.email
													.maxLength as number
											}
											spellCheck="false"
											placeholder="example@domain.com"
											autoComplete="email"
											autoCapitalize="off"
										/>
									</FormControl>

									<FormDescription className="sr-only">
										L&lsquo;adresse électronique qui doit
										être associée à votre compte.
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Mot de passe */}
						<FormField
							name="password"
							control={registerForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel
										htmlFor="password"
										className="sr-only"
									>
										Mot de passe
									</FormLabel>

									<FormControl>
										<div className="flex gap-2">
											<TooltipProvider>
												<Input
													{...field}
													id="password"
													type={passwordType}
													minLength={
														authSchema.shape
															.password
															.minLength as number
													}
													maxLength={
														authSchema.shape
															.password
															.maxLength as number
													}
													onInput={() => setPasswordType(
														"password"
													)}
													disabled={isLoading}
													spellCheck="false"
													placeholder="password"
													autoComplete="new-password"
													autoCapitalize="off"
												/>

												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															size="icon"
															type="button"
															variant="outline"
															disabled={isLoading}
															onClick={() =>
															{
																// Génération d'un nouveau mot de passe.
																registerForm.setValue(
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
														</Button>
													</TooltipTrigger>

													<TooltipContent>
														Générer un nouveau mot
														de passe sécurisé
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</FormControl>

									<FormDescription className="sr-only">
										Le mot de passe qui sera utilisé pour
										vous connecter à votre compte.
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire */}
						<Button disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Mail className="mr-2 h-4 w-4" />
							)}
							Inscription par courriel
						</Button>
					</form>
				</Form>
			</TabsContent>

			<TabsContent value="password" className="space-y-6">
				{/* Titre et description du formulaire */}
				<h2 className="text-xl font-semibold tracking-tight">
					Connexion à un compte
				</h2>

				<p className="text-sm text-muted-foreground">
					Saisissez votre adresse électronique et votre mot de passe
					pour vous connecter à votre compte.
				</p>

				<Form {...loginForm}>
					<form
						onSubmit={loginForm.handleSubmit( createEmailAccount )}
						className="space-y-6"
					>
						{/* Adresse électronique */}
						<FormField
							name="email"
							control={loginForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel className="sr-only">
										Adresse électronique
									</FormLabel>

									<FormControl>
										<Input
											{...field}
											type="email"
											disabled={isLoading}
											minLength={
												authSchema.shape.email
													.minLength as number
											}
											maxLength={
												authSchema.shape.email
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
							control={loginForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel className="sr-only">
										Mot de passe
									</FormLabel>

									<FormControl>
										<Input
											{...field}
											type={passwordType}
											disabled={isLoading}
											minLength={
												authSchema.shape.password
													.minLength as number
											}
											maxLength={
												authSchema.shape.password
													.maxLength as number
											}
											spellCheck="false"
											placeholder="password"
											autoComplete="current-password"
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
							control={registerForm.control}
							render={() => (
								<FormItem>
									<FormLabel className="sr-only">
										Se souvenir de moi
									</FormLabel>

									<FormControl>
										<div className="flex items-center justify-center space-x-2">
											<Switch
												id="remember-me"
												disabled={isLoading}
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
						<Button disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Mail className="mr-2 h-4 w-4" />
							)}
							Connexion par courriel
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

			{/* Services d'authentification OAuth */}
			<Button
				type="button"
				variant="outline"
				onClick={createOAuthAccount}
				disabled={isLoading}
			>
				{isLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
				)}
				Google
			</Button>

			<Button
				type="button"
				variant="outline"
				onClick={createOAuthAccount}
				disabled={isLoading}
			>
				{isLoading ? (
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