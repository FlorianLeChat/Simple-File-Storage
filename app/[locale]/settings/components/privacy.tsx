//
// Composant de paramétrage de la confidentialité.
//

"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Files, KeyRound, Scale, Trash, Loader2 } from "lucide-react";

import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription } from "../../components/ui/form";
import { deleteUserData } from "../actions/delete-user-data";

export default function Privacy()
{
	// Déclaration des variables d'état.
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals.share-manager" );
	const [ isLoading, setLoading ] = useState( false );
	const [ deleteState, deleteAction ] = useFormState( deleteUserData, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			files: false,
			account: false
		}
	} );

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !deleteState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( formMessages( "errors.action_failed" ), {
				description: formMessages( "errors.server_error" )
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = deleteState;

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

			toast.success( formMessages( "infos.action_success" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( formMessages( "errors.action_failed" ), {
				description: reason
			} );
		}
	}, [ form, deleteState, formMessages, modalMessages ] );

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
					return serverAction( deleteAction, formData );
				}}
				className="space-y-8"
			>
				{/* Documents légaux */}
				<FormField
					name="legal"
					render={() => (
						<FormItem>
							<Label>
								<Scale className="mr-2 inline h-6 w-6" />
								{formMessages( "fields.legal_label" )}
							</Label>

							<ul className="list-inside list-disc text-sm text-muted-foreground underline decoration-dotted underline-offset-4">
								<li>
									<Link
										href="/legal/terms"
										className="dark:hover:text-foreground"
									>
										{formMessages(
											"fields.legal_description_1"
										)}
									</Link>
								</li>

								<li>
									<Link
										href="/legal/privacy"
										className="dark:hover:text-foreground"
									>
										{formMessages(
											"fields.legal_description_2"
										)}
									</Link>
								</li>
							</ul>
						</FormItem>
					)}
				/>

				{/* Fichiers utilisateur */}
				<FormField
					name="files"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<Files className="mr-2 inline h-6 w-6" />
								{formMessages( "fields.user_files_label" )}
							</FormLabel>

							<FormDescription>
								{formMessages.rich(
									"fields.user_files_description",
									{
										b: ( chunks ) => (
											<strong>{chunks}</strong>
										),
										br: () => <br />
									}
								)}
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
									{formMessages( "fields.user_files_switch" )}
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Compte utilisateur */}
				<FormField
					name="account"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<KeyRound className="mr-2 inline h-6 w-6" />
								{formMessages( "fields.user_account_label" )}
							</FormLabel>

							<FormDescription>
								{formMessages.rich(
									"fields.user_account_description",
									{
										b: ( chunks ) => (
											<strong>{chunks}</strong>
										),
										br: () => <br />
									}
								)}
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={( value ) =>
										{
											if ( value )
											{
												// Activation de la suppression des fichiers.
												form.setValue( "files", true );
											}

											field.onChange( value );
										}}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									{formMessages( "fields.user_account_switch" )}
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button
					disabled={
						isLoading
						|| ( !form.getValues().files && !form.getValues().account )
					}
					className="max-sm:w-full"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{formMessages( "loading" )}
						</>
					) : (
						<>
							<Trash className="mr-2 h-4 w-4" />
							{modalMessages( "delete" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}