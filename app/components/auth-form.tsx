//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, type FormEvent } from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Form, FormItem, FormField, FormControl, FormMessage } from "./ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const authSchema = z.object( {
	email: z.string().min( 10 ).max( 100 ).email(),
	password: z.string().min( 10 ).max( 60 ),
	accepted: z.boolean().refine( ( value ) => value === true, {
		message:
			"Vous devez accepter les termes et conditions d&lsquo;utilisation."
	} )
} );

export default function AuthForm()
{
	// Déclaration des constantes.
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Requête de création d'un compte utilisateur par courriel.
	const createEmailAccount = ( values: z.infer<typeof authSchema> ) =>
	{
		console.log( values );
		setIsLoading( true );

		setTimeout( () =>
		{
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
			password: generateRandomPassword(),
			accepted: false
		}
	} );

	const loginForm = useForm<z.infer<typeof authSchema>>( {
		// Connexion.
		resolver: zodResolver( authSchema ),
		defaultValues: {
			email: "",
			password: "",
			accepted: true
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
				<h2 className="text-2xl font-semibold tracking-tight">
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
									<FormControl>
										<Input
											{...field}
											disabled={isLoading}
											spellCheck="false"
											placeholder="example@domain.com"
											autoComplete="email"
											autoCapitalize="off"
										/>
									</FormControl>

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
									<FormControl>
										<Input
											{...field}
											disabled={isLoading}
											spellCheck="false"
											placeholder="password"
											autoComplete="new-password"
											autoCapitalize="off"
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Acceptation des conditions d'utilisation */}
						<FormField
							name="accepted"
							control={registerForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormControl>
										<div className="flex items-center justify-center space-x-2">
											<Checkbox
												id="terms"
												checked={field.value}
												disabled={isLoading}
												onCheckedChange={field.onChange}
											/>

											<Label htmlFor="terms">
												Accepter les termes et
												conditions mentionnés
												ci-dessous.
											</Label>
										</div>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire. */}
						<Button disabled={isLoading}>
							{isLoading && (
								<FontAwesomeIcon
									spin
									icon={faSpinner}
									className="mr-2 h-4 w-4"
								/>
							)}
							Inscription par courriel
						</Button>
					</form>
				</Form>
			</TabsContent>

			<TabsContent value="password" className="space-y-6">
				{/* Titre et description du formulaire */}
				<h2 className="text-2xl font-semibold tracking-tight">
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
									<FormControl>
										<Input
											{...field}
											disabled={isLoading}
											spellCheck="false"
											placeholder="example@domain.com"
											autoComplete="email"
											autoCapitalize="off"
										/>
									</FormControl>

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
									<FormControl>
										<Input
											{...field}
											disabled={isLoading}
											spellCheck="false"
											placeholder="password"
											autoComplete="new-password"
											autoCapitalize="off"
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Se souvenir de moi */}
						<FormField
							name="accepted"
							control={registerForm.control}
							render={() => (
								<FormItem>
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
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire. */}
						<Button disabled={isLoading}>
							{isLoading && (
								<FontAwesomeIcon
									spin
									icon={faSpinner}
									className="mr-2 h-4 w-4"
								/>
							)}
							Connexion par courriel
						</Button>
					</form>
				</Form>
			</TabsContent>

			{/* Séparateur entre l'authentification classique et par OAuth. */}
			<div className="relative text-center">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>

				<span className="relative bg-background px-2 text-xs uppercase text-muted-foreground">
					Ou continuer avec
				</span>
			</div>

			{/* Services d'authentification OAuth. */}
			<Button
				type="button"
				variant="outline"
				onClick={createOAuthAccount}
				disabled={isLoading}
			>
				{isLoading ? (
					<FontAwesomeIcon
						spin
						icon={faSpinner}
						className="mr-2 h-4 w-4"
					/>
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
					<FontAwesomeIcon
						spin
						icon={faSpinner}
						className="mr-2 h-4 w-4"
					/>
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
					Conditions d&lsquo;utilisation
				</Link>{" "}
				et notre{" "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-primary"
				>
					Politique de confidentialité
				</Link>
				.
			</p>
		</Tabs>
	);
}