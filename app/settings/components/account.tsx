//
// Composant de paramétrage du compte utilisateur.
//

"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Lock, Contact, Loader2, RefreshCw } from "lucide-react";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";

// Déclaration des langues disponibles.
const languages = [
	{ label: "Anglais", value: "en" },
	{ label: "Français", value: "fr" }
] as const;

// Déclaration du schéma de validation du formulaire.
const accountForm = z.object( {
	realname: z.string().min( 10 ).max( 50 ),
	language: z.enum( [ "en", "fr" ] ),
	password: z.string().min( 10 ).max( 100 ).optional()
} );

export default function Account()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const updateAccount = ( data: z.infer<typeof accountForm> ) =>
	{
		setIsLoading( true );

		setTimeout( () =>
		{
			toast( {
				title: "Vous avez soumis les informations suivantes :",
				description: (
					<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
						<code className="text-white">
							{JSON.stringify( data, null, 4 )}
						</code>
					</pre>
				)
			} );

			setIsLoading( false );
		}, 3000 );
	};

	// Définition du formulaire.
	const form = useForm<z.infer<typeof accountForm>>( {
		resolver: zodResolver( accountForm ),
		defaultValues: {
			realname: "Florian4016",
			language: "fr"
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit( updateAccount )}
				className="space-y-8"
			>
				{/* Nom d'affichage */}
				<FormField
					name="realname"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<Contact className="mr-2 inline h-6 w-6" />
								Nom d&lsquo;affichage
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									spellCheck="false"
									placeholder="John Doe"
									autoComplete="name"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								Ceci est le nom qui sera affiché sur votre
								profil et dans les courriels.
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
							<FormLabel>
								<Languages className="mr-2 inline h-6 w-6" />
								Langue préférée
							</FormLabel>

							<FormControl>
								<Select
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Sélectionner une langue" />
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
								l&lsquo;ensemble des pages du site.
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

							<FormControl>
								<Input
									{...field}
									type="password"
									disabled
									spellCheck="false"
									placeholder="password"
									autoComplete="new-password"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								Ceci est le mot de passe qui sera utilisé pour
								vous connecter à votre compte.{" "}
								<em>
									Ceci ne concerne pas les comptes utilisant
									le protocole OAuth.
								</em>
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
						<RefreshCw className="mr-2 h-4 w-4" />
					)}
					Mettre à jour
				</Button>
			</form>
		</Form>
	);
}