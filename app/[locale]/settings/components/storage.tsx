//
// Composant de paramétrage du stockage.
//

"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { Globe, Link2, RefreshCw, Loader2, History } from "lucide-react";
import { useState, useEffect, useActionState, startTransition } from "react";

import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription } from "../../components/ui/form";
import { updateStorage } from "../actions/update-storage";

export default function Storage( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isLoading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useActionState( updateStorage, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			public: session.user.preferences.public,
			extension: session.user.preferences.extension,
			versions: session.user.preferences.versions
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

			toast.error( messages( "infos.action_failed" ), {
				description: messages( "errors.server_error" )
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

		// On affiche enfin une notification avec la raison fournie.
		if ( success )
		{
			toast.success( messages( "infos.action_success" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( messages( "infos.action_failed" ), {
				description: reason
			} );
		}
	}, [ form, messages, updateState ] );

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
						return;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Exécution de l'action côté serveur.
					startTransition( () =>
					{
						serverAction( updateAction, formData );
					} );
				}}
				className="space-y-8"
			>
				{/* Mettre les fichiers en public */}
				<FormField
					name="public"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<Globe className="mr-2 inline size-6" />
								{messages( "fields.public_label" )}
							</FormLabel>

							<FormDescription>
								{messages.rich( "fields.public_description", {
									b: ( chunks ) => <strong>{chunks}</strong>
								} )}
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={field.onChange}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									{messages( "fields.public_trigger" )}
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Affichage des extensions */}
				<FormField
					name="extension"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<Link2 className="mr-2 inline size-6" />
								{messages( "fields.extension_label" )}
							</FormLabel>

							<FormDescription>
								{messages.rich( "fields.extension_description", {
									b: ( chunks ) => <strong>{chunks}</strong>
								} )}
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={field.onChange}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									{messages( "fields.extension_trigger" )}
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Enregistrement des anciennes versions */}
				<FormField
					name="versions"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<History className="mr-2 inline size-6" />
								{messages( "fields.versions_label" )}
							</FormLabel>

							<FormDescription>
								{messages.rich( "fields.versions_description", {
									i: ( chunks ) => <em>{chunks}</em>,
									b: ( chunks ) => <strong>{chunks}</strong>,
									br: () => <br />
								} )}
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={field.onChange}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									{messages( "fields.versions_trigger" )}
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							{messages( "loading" )}
						</>
					) : (
						<>
							<RefreshCw className="mr-2 size-4" />
							{messages( "update" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}