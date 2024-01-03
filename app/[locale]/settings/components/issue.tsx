//
// Composant de signalement des bogues.
//

"use client";

import schema from "@/schemas/issue";
import { List,
	Send,
	Globe,
	Loader2,
	Subtitles,
	ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useFormState } from "react-dom";
import { useState, useEffect } from "react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import { Textarea } from "../../components/ui/textarea";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { createIssue } from "../issue/actions";

export default function Account()
{
	// Déclaration des constantes.
	const { toast } = useToast();
	const formState = {
		success: true,
		reason: ""
	};

	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( createIssue, formState );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			area: "account",
			subject: "",
			severity: "low",
			description: ""
		}
	} );

	// Affichage des erreurs en provenance du serveur.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !updateState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast( {
				title: "form.errors.update_failed",
				variant: "destructive",
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère également une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après la totalité du formulaire
		//  en cas de succès.
		if ( success )
		{
			form.reset();
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			toast( {
				title: success
					? "form.info.update_success"
					: "form.errors.update_failed",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ toast, form, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={( formData ) => serverAction( updateAction, formData )}
				onSubmit={() => setLoading( true )}
				className="space-y-8"
			>
				<div className="flex gap-4 max-sm:flex-col">
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
										{...field}
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger
											id="area"
											disabled={loading}
											className="h-auto"
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
									Indiquez le domaine concerné par le bogue.
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
							<FormItem className="max-sm:mt-4">
								<FormLabel htmlFor="level">
									<ShieldAlert className="mr-2 inline h-6 w-6" />
									Sévérité
								</FormLabel>

								<FormControl>
									<Select
										{...field}
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger
											id="level"
											disabled={loading}
											className="w-full truncate sm:w-[160px]"
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
									Indiquez la sévérité (selon vous) du bogue.
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
									disabled={loading}
									minLength={
										schema.shape.subject.minLength as number
									}
									maxLength={
										schema.shape.subject.maxLength as number
									}
									placeholder="Il y a un problème avec..."
								/>
							</FormControl>

							<FormDescription className="sr-only">
								Écrivez un sujet court pour décrire le bogue.
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
									disabled={loading}
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
								Expliquez en détail le bogue que vous avez
								rencontré et comment le reproduire.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={loading} className="max-sm:w-full">
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Envoi...
						</>
					) : (
						<>
							<Send className="mr-2 h-4 w-4" />
							Envoyer
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}