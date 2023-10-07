//
// Composant de signalement des bogues.
//

"use client";

import * as z from "zod";
import { List,
	Send,
	Globe,
	Loader2,
	Subtitles,
	ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";

// Déclaration du schéma de validation du formulaire.
const schema = z.object( {
	area: z.enum( [ "account", "upload", "sharing", "other" ] ),
	severity: z.enum( [ "critical", "high", "medium", "low" ] ),
	subject: z.string().min( 10 ).max( 50 ),
	description: z.string().min( 50 ).max( 1000 )
} );

export default function Account()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const openIssue = ( data: z.infer<typeof schema> ) =>
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
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			area: "account",
			severity: "low"
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit( openIssue )} className="space-y-8">
				<div className="flex gap-4">
					{/* Domaine touché */}
					<FormField
						name="area"
						control={form.control}
						render={( { field } ) => (
							<FormItem className="w-full">
								<FormLabel htmlFor="area">
									<Globe className="mr-2 inline h-6 w-6" />
									Domaine
								</FormLabel>

								<FormControl>
									<Select
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger
											id="area"
											aria-controls="area"
										>
											<SelectValue />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value="account">
												Modification des informations du
												compte
											</SelectItem>

											<SelectItem value="upload">
												Téléversement des fichiers vers
												le serveur
											</SelectItem>

											<SelectItem value="sharing">
												Partages des fichiers avec
												d&lsquo;autres utilisateurs
											</SelectItem>

											<SelectItem value="other">
												Autres / Non classé
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>

								<FormDescription className="sr-only">
									Test
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Sévérité */}
					<FormField
						name="severity"
						control={form.control}
						render={( { field } ) => (
							<FormItem>
								<FormLabel htmlFor="level">
									<ShieldAlert className="mr-2 inline h-6 w-6" />
									Sévérité
								</FormLabel>

								<FormControl>
									<Select
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger
											id="level"
											className="line-clamp-1 w-[160px] truncate"
											aria-controls="level"
										>
											<SelectValue />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value="critical">
												Critique
											</SelectItem>

											<SelectItem value="high">
												Élevé
											</SelectItem>

											<SelectItem value="medium">
												Moyen
											</SelectItem>

											<SelectItem value="low">
												Bas
											</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>

								<FormDescription className="sr-only">
									Test
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Sujet */}
				<FormField
					name="subject"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="subject">
								<List className="mr-2 inline h-6 w-6" />
								Sujet
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									id="subject"
									minLength={
										schema.shape.subject.minLength as number
									}
									maxLength={
										schema.shape.subject.maxLength as number
									}
									disabled={isLoading}
									placeholder="Il y a un problème avec..."
								/>
							</FormControl>

							<FormDescription className="sr-only">
								Test
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Description */}
				<FormField
					name="description"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="description">
								<Subtitles className="mr-2 inline h-6 w-6" />
								Description
							</FormLabel>

							<FormControl>
								<Textarea
									{...field}
									id="description"
									disabled={isLoading}
									minLength={
										schema.shape.description
											.minLength as number
									}
									maxLength={
										schema.shape.description
											.maxLength as number
									}
									className="max-h-[150px]"
									placeholder="Veillez inclure toutes les informations pertinentes à votre signalement."
								/>
							</FormControl>

							<FormDescription className="sr-only">
								Test
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
						<Send className="mr-2 h-4 w-4" />
					)}
					Envoyer
				</Button>
			</form>
		</Form>
	);
}