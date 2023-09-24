//
// Composant de paramétrage du compte utilisateur.
//

"use client";

import * as z from "zod";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Languages, Check, Loader2, RefreshCw } from "lucide-react";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem } from "../../components/ui/command";
import { Popover,
	PopoverContent,
	PopoverTrigger } from "../../components/ui/popover";
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
							<FormLabel>Nom d&lsquo;affichage</FormLabel>

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
							<FormLabel>Langue préférée</FormLabel>

							<FormControl>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											role="combobox"
											variant="outline"
											className={merge(
												"w-[200px] justify-between",
												!field.value
													&& "text-muted-foreground"
											)}
										>
											{field.value
												? languages.find(
													( language ) => language.value
															=== field.value
												)?.label
												: "Sélectionnez une langue"}

											<Languages className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>

									<PopoverContent className="w-[200px] p-0">
										<Command>
											<CommandInput placeholder="Rechercher..." />

											<CommandEmpty>
												Aucun résultat
											</CommandEmpty>

											<CommandGroup>
												{languages.map( ( language ) => (
													<CommandItem
														key={language.value}
														value={language.label}
														onSelect={() =>
														{
															form.setValue(
																"language",
																language.value
															);
														}}
													>
														<Check
															className={merge(
																"mr-2 h-4 w-4",
																language.value
																	=== field.value
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
														{language.label}
													</CommandItem>
												) )}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
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
							<FormLabel>Mot de passe</FormLabel>

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