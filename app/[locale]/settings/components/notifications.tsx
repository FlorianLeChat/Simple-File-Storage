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
import serverAction from "@/utilities/server-action";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useState, useEffect, useActionState } from "react";

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

export default function Notifications( { session }: Readonly<{ session: Session }> )
{
	// Déclaration des constantes.
	const notifications = session.user.notification.split( "+" );

	// Déclaration du formulaire.
	const level = notifications[ 0 ] as "all" | "necessary" | "off";
	const form = useForm( {
		defaultValues: {
			push: notifications[ 1 ] === "mail",
			level
		}
	} );

	// Méthode passerelle pour la mise à jour des paramètres de notifications.
	const proxyUpdateNotifications = async ( lastState: Record<string, unknown>, formData: FormData ) =>
	{
		const state = await form.trigger();

		if ( !state )
		{
			return;
		}

		formData.set( "level", form.getValues( "level" ) );

		return serverAction( updateNotifications, lastState, formData );
	};

	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isPush, setIsPush ] = useState( notifications[ 0 ] !== "off" );
	const [ updateState, updateAction, isPending ] = useActionState( proxyUpdateNotifications, {
		success: true,
		reason: ""
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
			<form action={updateAction} className="space-y-8">
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
									disabled={isPending || !isPush}
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
									disabled={isPending}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "all" : level
										);

										setIsPush( true );
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
									disabled={isPending}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "necessary" : level
										);

										setIsPush( true );
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
									disabled={isPending}
									className="ml-auto"
									onCheckedChange={( checked ) =>
									{
										form.setValue(
											"level",
											checked ? "off" : level
										);
										form.setValue( "push", false );

										setIsPush( !checked );
									}}
								/>
							</div>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isPending} className="max-sm:w-full">
					{isPending ? (
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