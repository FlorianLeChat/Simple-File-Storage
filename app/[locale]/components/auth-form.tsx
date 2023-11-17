//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { LogIn, Loader2, Mail, RefreshCw, KeyRound } from "lucide-react";

import { getAuthErrorMessage } from "@/utilities/next-auth";

import { merge } from "@/utilities/tailwind";
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
import { ToastAction } from "./ui/toast";
import { Button, buttonVariants } from "./ui/button";

// Déclaration du schéma de validation du formulaire.
//  Note : le mot de passe est optionnel pour la connexion par courriel
//    mais obligatoire pour la connexion par mot de passe.
const requiredPassword = z.string().min( 10 ).max( 60 );
const optionalPassword = z.string().optional().optional();
const schema = z.object( {
	email: z.string().min( 10 ).max( 100 ).email(),
	password: optionalPassword,
	remembered: z.boolean().optional()
} );

export default function AuthForm()
{
	// Déclaration des constantes.
	const router = useRouter();
	const { toast } = useToast();
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration des variables d'état.
	const [ focused, setFocused ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ passwordType, setPasswordType ] = useState( "text" );
	const [ authenticationMethod, setAuthenticationMethod ] = useState( "email" );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			email: "",
			password: "",
			remembered: false
		}
	} );

	// Requête d'authentification d'un compte utilisateur.
	const authenticateAccount = async ( values: z.infer<typeof schema> ) =>
	{
		// On indique d'abord que le formulaire est en cours de traitement.
		setIsLoading( true );

		// On effectue ensuite une requête de création d'un compte utilisateur
		//  via son adresse électronique et son mot de passe avant d'attente
		//  la réponse du serveur.
		const response = await signIn( authenticationMethod, {
			email: values.email,
			password: values.password,
			redirect: false,
			callbackUrl: "/dashboard"
		} );

		// On vérifie si le serveur a renvoyé une courriel de validation.
		const verifyRequest = response?.url?.includes( "verify-request" );

		if ( verifyRequest )
		{
			// Si c'est le cas, on affiche un message de succès avant de
			//  bloquer le formulaire pour signifier que l'utilisateur
			//  doit valider son adresse électronique.
			toast( {
				title: "Action nécessaire",
				description: getAuthErrorMessage( "ValidationRequired" )
			} );

			// On réinitialise par la même occasion l'entièreté du formulaire.
			form.reset();
		}
		else if ( response?.ok )
		{
			// En cas de réussite, on redirige l'utilisateur vers la page
			//  de son tableau de bord (ou celle indiquée par le serveur).
			router.push( response.url ?? "/dashboard" );
		}
		else
		{
			// Dans le cas contraire, on affiche après un message d'erreur.
			const error = response?.error ?? "";

			toast( {
				title: "Authentification échouée",
				variant: "destructive",
				description:
					getAuthErrorMessage( error )
					?? "Une erreur interne est survenue lors de l'authentification.",
				action: (
					<ToastAction
						altText="Réessayer"
						onClick={() => signIn( "email", { callbackUrl: "/dashboard" } )}
					>
						Réessayer
					</ToastAction>
				)
			} );
		}

		// On indique enfin que le formulaire a fini d'être traité.
		setIsLoading( false );
	};

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

	// Affichage du rendu HTML du composant.
	return (
		<main className="flex w-full flex-col justify-center space-y-6 p-4 px-4 text-center sm:mx-auto sm:w-[500px]">
			{/* Titre et description du formulaire */}
			<h2 className="text-xl font-semibold tracking-tight">
				<LogIn className="mr-2 inline" />

				<span className="align-middle">Authentification</span>
			</h2>

			<p className="text-sm text-muted-foreground">
				Saisissez votre adresse électronique et votre mot de passe pour
				vous connecter à votre compte existant ou en créer un nouveau.
			</p>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit( authenticateAccount )}
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
										disabled={isLoading}
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
													field.value?.length
															!== 0
												)}
												onFocus={() => setFocused( true )}
												onKeyUp={( event ) =>
												{
													// Affichage du mot de passe masqué.
													setPasswordType( "password" );

													// Modification de la méthode d'authentification
													//  et du schéma de validation du formulaire.
													const method =
														event.currentTarget
															.value.length > 0
															? "credentials"
															: "email";

													setAuthenticationMethod(
														method
													);

													schema.extend( {
														password:
															method === "email"
																? optionalPassword
																: requiredPassword
													} );
												}}
												disabled={isLoading}
												className={`transition-opacity ${
													!focused && "opacity-25"
												}`}
												minLength={
													requiredPassword.minLength as number
												}
												maxLength={
													requiredPassword.maxLength as number
												}
												spellCheck="false"
												placeholder="password"
												autoComplete="new-password"
												autoCapitalize="off"
											/>

											<Tooltip>
												<TooltipTrigger
													type="button"
													disabled={isLoading}
													className={merge(
														`transition-opacity ${
															!focused
															&& "opacity-25"
														}`,
														buttonVariants( {
															size: "icon",
															variant: "outline"
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
														setPasswordType( "text" );

														// Modification de la méthode d'authentification.
														setAuthenticationMethod(
															"credentials"
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
									Le mot de passe utilisé pour vous connecter
									à votre compte.
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
											disabled={isLoading}
										/>

										<Label htmlFor="remember-me">
											Se souvenir de moi
										</Label>
									</div>
								</FormControl>

								<FormDescription className="sr-only">
									Pour rester connecté à votre compte lorsque
									vous revenez sur le site.
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
							<>
								{authenticationMethod === "email" && (
									<>
										<Mail className="mr-2 h-4 w-4" />
										Authentification par courriel
									</>
								)}

								{authenticationMethod === "credentials" && (
									<>
										<KeyRound className="mr-2 h-4 w-4" />
										Authentification par mot de passe
									</>
								)}
							</>
						)}
					</Button>
				</form>
			</Form>

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
				onClick={() => signIn( "github", { callbackUrl: "/dashboard" } )}
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
		</main>
	);
}