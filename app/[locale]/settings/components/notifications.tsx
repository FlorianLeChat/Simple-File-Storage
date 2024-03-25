//
// Composant de paramétrage des notifications.
//

"use client";

import { Mail,
	Loader2,
	BellOff,
	BellPlus,
	BellMinus,
	RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import type { Session } from "next-auth";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { updateNotifications } from "../actions/update-notifications";

export default function Notifications( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const notifications = session.user.notification.split( "+" );

	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isPush, setPush ] = useState( notifications[ 0 ] !== "off" );
	const [ isLoading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateNotifications, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const level = notifications[ 0 ] as "all" | "necessary" | "off";
	const form = useForm( {
		defaultValues: {
			push: notifications[ 1 ] === "mail",
			level
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

			toast.error( messages( "errors.action_failed" ), {
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
			toast.error( messages( "errors.action_failed" ), {
				description: reason
			} );
		}
	}, [ form, messages, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={async ( formData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return false;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Récupération des données du formulaire.
					formData.set( "level", form.getValues( "level" ) );

					// Exécution de l'action côté serveur.
					return serverAction( updateAction, formData );
				}}
				className="space-y-8"
			>
				{/* Activation des notifications par courriel */}
				<FormField
					name="push"
					control={form.control}
					render={( { field } ) => (
						<FormItem
							className={`flex items-center gap-4 space-y-0 rounded-md border p-4 transition-opacity ${
								!isPush ? "opacity-50" : ""
							}`}
						>
							<Mail className="max-sm:hidden" />

							<div className="flex-1">
								<FormLabel
									htmlFor={field.name}
									className="text-sm font-medium leading-4"
								>
									{messages( "fields.notifications_label" )}
								</FormLabel>

								<FormDescription className="text-sm text-muted-foreground">
									{messages(
										"fields.notifications_description"
									)}
								</FormDescription>
							</div>

							<FormControl>
								<Switch
									id={field.name}
									name={field.name}
									checked={field.value}
									disabled={isLoading || !isPush}
									onCheckedChange={field.onChange}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Niveau de notification */}
				<FormField
					name="level"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="grid gap-6">
							{/* Toutes les notifications */}
							<div className="flex items-center gap-4">
								<BellPlus className="min-w-fit max-sm:hidden" />

								<div>
									<h4 className="mb-2 text-sm font-medium leading-4 sm:mb-1">
										{messages(
											"fields.notifications_all_label"
										)}
									</h4>

									<p className="text-sm text-muted-foreground">
										{messages(
											"fields.notifications_all_description"
										)}
									</p>
								</div>

								<Switch
									checked={field.value === "all"}
									disabled={isLoading}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "all" : level
										);

										setPush( true );
									}}
								/>
							</div>

							{/* Notifications nécessaires */}
							<div className="flex items-center gap-4">
								<BellMinus className="min-w-fit max-sm:hidden" />

								<div>
									<h4 className="mb-2 text-sm font-medium leading-4 sm:mb-1">
										{messages(
											"fields.notifications_necessary_label"
										)}
									</h4>

									<p className="text-sm text-muted-foreground">
										{messages(
											"fields.notifications_necessary_description"
										)}
									</p>
								</div>

								<Switch
									checked={field.value === "necessary"}
									disabled={isLoading}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "necessary" : level
										);

										setPush( true );
									}}
								/>
							</div>

							{/* Aucune notification */}
							<div className="flex items-center gap-4">
								<BellOff className="min-w-fit max-sm:hidden" />

								<div>
									<h4 className="mb-2 text-sm font-medium leading-4 sm:mb-1">
										{messages(
											"fields.notifications_off_label"
										)}
									</h4>

									<p className="text-sm text-muted-foreground">
										{messages(
											"fields.notifications_off_description"
										)}
									</p>
								</div>

								<Switch
									checked={field.value === "off"}
									disabled={isLoading}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "off" : level
										);
										form.setValue( "push", false );

										setPush( !checked );
									}}
								/>
							</div>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{messages( "loading" )}
						</>
					) : (
						<>
							<RefreshCw className="mr-2 h-4 w-4" />
							{messages( "update" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}