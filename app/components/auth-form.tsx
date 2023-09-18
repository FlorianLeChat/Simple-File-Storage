//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import Link from "next/link";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, type FormEvent } from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function AuthForm()
{
	// Déclaration des constantes.
	const characters =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";

	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Requête de création d'un compte utilisateur par courriel.
	const createEmailAccount = ( event: FormEvent<HTMLFormElement> ) =>
	{
		event.preventDefault();
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

				<form className="grid gap-2" onSubmit={createEmailAccount}>
					{/* Adresse électronique */}
					<Label className="sr-only" htmlFor="email">
						Adresse électronique
					</Label>

					<Input
						id="email"
						type="email"
						disabled={isLoading}
						minLength={10}
						maxLength={100}
						spellCheck="false"
						placeholder="example@domain.com"
						autoComplete="email"
						autoCapitalize="off"
						required
					/>

					{/* Mot de passe */}
					<Label className="sr-only" htmlFor="password">
						Mot de passe
					</Label>

					<Input
						id="password"
						type="password"
						disabled={isLoading}
						minLength={10}
						maxLength={60}
						spellCheck="false"
						placeholder={generateRandomPassword()}
						autoComplete="new-password"
						autoCapitalize="off"
						required
					/>

					{/* Acceptation des conditions d'utilisation */}
					<div className="my-3 flex items-center justify-center space-x-2">
						<Checkbox id="terms" disabled={isLoading} required />

						<Label htmlFor="terms">
							Accepter les termes et conditions mentionnés
							ci-dessous.
						</Label>
					</div>

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

				<form className="grid gap-2" onSubmit={createEmailAccount}>
					{/* Adresse électronique */}
					<Label className="sr-only" htmlFor="email">
						Adresse électronique
					</Label>

					<Input
						id="email"
						type="email"
						disabled={isLoading}
						minLength={10}
						maxLength={100}
						spellCheck="false"
						placeholder="Adresse électronique"
						autoComplete="email"
						autoCapitalize="off"
						required
					/>

					{/* Mot de passe */}
					<Label className="sr-only" htmlFor="password">
						Mot de passe
					</Label>

					<Input
						id="password"
						type="password"
						disabled={isLoading}
						minLength={10}
						maxLength={60}
						spellCheck="false"
						placeholder="Mot de passe"
						autoComplete="current-password"
						autoCapitalize="off"
						required
					/>

					{/* Se souvenir de moi */}
					<div className="my-3 flex items-center justify-center space-x-2">
						<Switch
							id="remember-me"
							disabled={isLoading}
							required
						/>
						<Label htmlFor="remember-me">Se souvenir de moi</Label>
					</div>

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