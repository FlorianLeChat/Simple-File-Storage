//
// Composant du formulaire d'authentification (connexion ou inscription).
//

"use client";

import { useState, type FormEvent } from "react";
import { Icons } from "./icons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export function UserAuthForm()
{
	const [ isLoading, setIsLoading ] = useState( false );

	function onSubmit( event: FormEvent )
	{
		event.preventDefault();
		setIsLoading( true );

		setTimeout( () =>
		{
			setIsLoading( false );
		}, 3000 );
	}

	return (
		<>
			<form className="grid gap-2" onSubmit={onSubmit}>
				<Label className="sr-only" htmlFor="email">
					Adresse électronique
				</Label>

				<Input
					id="email"
					type="email"
					disabled={isLoading}
					spellCheck="false"
					autoCorrect="off"
					placeholder="name@example.com"
					autoComplete="email"
					autoCapitalize="none"
				/>

				<Button disabled={isLoading}>
					{isLoading && (
						<Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
					)}

					Connexion par courriel
				</Button>
			</form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>

				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Ou continuer avec
					</span>
				</div>
			</div>

			<Button variant="outline" type="button" disabled={isLoading}>
				{isLoading ? (
					<Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Icons.Google className="mr-2 h-4 w-4" />
				)}

				Google
			</Button>

			<Button variant="outline" type="button" disabled={isLoading}>
				{isLoading ? (
					<Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Icons.GitHub className="mr-2 h-4 w-4" />
				)}
				GitHub
			</Button>
		</>
	);
}