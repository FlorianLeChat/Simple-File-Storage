//
// Composant de paramétrage de la confidentialité.
//

"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import serverAction from "@/utilities/server-action";
import { useTranslations } from "next-intl";
import { useEffect, useActionState } from "react";
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
	const [ deleteState, deleteAction, isPending ] = useActionState( deleteUserData, {
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
			toast.error( formMessages( "infos.action_failed" ), {
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
		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			toast.success( formMessages( "infos.action_success" ), {
				description: reason
			} );

			if ( form.getValues( "files" ) && form.getValues( "account" ) )
			{
				// Si on supprime totalement le compte utilisateur, on
				//  redirige vers la page d'accueil.
				redirect( "/" );
			}
			else
			{
				// Sinon, on réinitialise le formulaire.
				form.reset();
			}
		}
		else
		{
			toast.error( formMessages( "infos.action_failed" ), {
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
						return;
					}

					// Exécution de l'action côté serveur.
					serverAction( deleteAction, formData, formMessages );
				}}
				className="space-y-8"
			>
				{/* Documents légaux */}
				<FormField
					name="legal"
					render={() => (
						<FormItem>
							<Label>
								<Scale className="mr-2 inline size-6" />
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
								<Files className="mr-2 inline size-6" />
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
										disabled={isPending}
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
								<KeyRound className="mr-2 inline size-6" />
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
										disabled={isPending}
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
					disabled={isPending || ( !form.getValues().files && !form.getValues().account )}
					className="max-sm:w-full"
				>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							{formMessages( "loading" )}
						</>
					) : (
						<>
							<Trash className="mr-2 size-4" />
							{modalMessages( "delete" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}