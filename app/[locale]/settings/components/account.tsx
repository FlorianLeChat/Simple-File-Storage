//
// Composant de paramétrage du compte utilisateur.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/account";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
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

export default function Account( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Déclaration des constantes.
	const locale = useLocale() as "en" | "fr";

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			realname: session.user?.name ?? "",
			language: locale
		}
	} );

	// Mise à jour des informations.
	const updateAccount = ( data: z.infer<typeof schema> ) =>
	{
		setIsLoading( true );

		document.cookie = `NEXT_LOCALE=${ data.language }; path=/`;

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

							<FormControl className="hidden">
								<Input
									{...field}
									disabled
									minLength={
										schema.shape.realname
											.minLength as number
									}
									maxLength={
										schema.shape.realname
											.maxLength as number
									}
									spellCheck="false"
									placeholder="John Doe"
									autoComplete="name"
									autoCapitalize="off"
								/>
							</FormControl>

							{session ? (
								<FormDescription className="font-extrabold text-destructive">
									Ce paramètre ne peut pas être modifié en
									raison de l&lsquo;utilisation d&lsquo;un
									fournisseur d&lsquo;authentification externe
									pour vous connecter au site.
								</FormDescription>
							) : (
								<FormDescription>
									Ceci est le nom qui sera affiché sur votre
									profil et dans la recherche
									d&lsquo;utilisateurs pour partager des
									fichiers.
								</FormDescription>
							)}

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
							<FormLabel htmlFor="language">
								<Languages className="mr-2 inline h-6 w-6" />
								Langue préférée
							</FormLabel>

							<FormControl>
								<Select
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="language"
										aria-controls="language"
									>
										<SelectValue />
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

							<FormControl className="hidden">
								<Input
									{...field}
									type="password"
									disabled
									minLength={
										schema.shape.password
											.minLength as number
									}
									maxLength={
										schema.shape.password
											.maxLength as number
									}
									spellCheck="false"
									placeholder="password"
									autoComplete="new-password"
									autoCapitalize="off"
								/>
							</FormControl>

							{session ? (
								<FormDescription className="font-extrabold text-destructive">
									Ce paramètre ne peut pas être modifié en
									raison de l&lsquo;utilisation d&lsquo;un
									fournisseur d&lsquo;authentification externe
									pour vous connecter au site.
								</FormDescription>
							) : (
								<FormDescription>
									Ceci est le mot de passe qui sera utilisé
									pour vous connecter à votre compte.
								</FormDescription>
							)}

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Mise à jour...
						</>
					) : (
						<>
							<RefreshCw className="mr-2 h-4 w-4" />
							Mettre à jour
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}