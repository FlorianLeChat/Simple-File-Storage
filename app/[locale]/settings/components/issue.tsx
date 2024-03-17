//
// Composant de signalement des bogues.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/issue";
import { toast } from "sonner";
import { List,
	Send,
	Globe,
	Loader2,
	Subtitles,
	ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useState, useEffect } from "react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { createIssue } from "../actions/create-issue";

export default function Account()
{
	// Déclaration des variables d'état.
	const [ isLoading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( createIssue, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			area: "account",
			subject: "",
			severity: "low",
			description: ""
		}
	} );

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !updateState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		if ( reason === "" )
		{
			return;
		}

		// On informe après qu'une réponse a été reçue.
		setLoading( false );

		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			form.reset();

			toast.success( "form.info.update_success", {
				description: reason
			} );
		}
		else
		{
			toast.error( "form.errors.update_failed", {
				description: reason
			} );
		}
	}, [ form, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={async ( formData: FormData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return false;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Exécution de l'action côté serveur.
					return serverAction( updateAction, formData );
				}}
				className="space-y-8"
			>
				{/* Domaine touché */}
				<FormField
					name="area"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="sm:inline-block sm:w-[calc(100%-160px-1rem)]">
							<FormLabel>
								<Globe className="mr-2 inline h-6 w-6" />
								Domaine
							</FormLabel>

							<Select
								{...field}
								disabled={isLoading}
								defaultValue={field.value}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger className="h-auto">
										<SelectValue />
									</SelectTrigger>
								</FormControl>

								<SelectContent>
									<SelectItem value="account">
										Modification des informations du compte
									</SelectItem>

									<SelectItem value="upload">
										Téléversement des fichiers vers le
										serveur
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
						<FormItem className="sm:!mt-0 sm:ml-2 sm:inline-block">
							<FormLabel>
								<ShieldAlert className="mr-2 inline h-6 w-6" />
								Sévérité
							</FormLabel>

							<Select
								{...field}
								disabled={isLoading}
								defaultValue={field.value}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger className="h-auto w-full truncate sm:w-[160px]">
										<SelectValue />
									</SelectTrigger>
								</FormControl>

								<SelectContent>
									<SelectItem value="critical">
										Critique
									</SelectItem>

									<SelectItem value="high">Élevé</SelectItem>

									<SelectItem value="medium">
										Moyen
									</SelectItem>

									<SelectItem value="low">Bas</SelectItem>
								</SelectContent>
							</Select>

							<FormDescription className="sr-only">
								Indiquez la sévérité (selon vous) du bogue.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Sujet */}
				<FormField
					name="subject"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<List className="mr-2 inline h-6 w-6" />
								Sujet
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
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
							<FormLabel>
								<Subtitles className="mr-2 inline h-6 w-6" />
								Description
							</FormLabel>

							<FormControl>
								<Textarea
									{...field}
									disabled={isLoading}
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
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
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