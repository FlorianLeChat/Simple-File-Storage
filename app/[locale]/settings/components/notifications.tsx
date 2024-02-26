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
import { updateNotifications } from "../notifications/actions";

export default function Notifications( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const notifications = session.user.notification.split( "+" );

	// Déclaration des variables d'état.
	const [ push, setPush ] = useState( notifications[ 0 ] !== "off" );
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateNotifications, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			push: notifications[ 1 ] === "mail",
			level: notifications[ 0 ] as "all" | "necessary" | "off"
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

		// On affiche enfin une notification avec la raison fournie.
		if ( success )
		{
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
				action={( formData ) => serverAction( updateAction, formData )}
				onSubmit={() => setLoading( true )}
				className="space-y-6"
			>
				{/* Activation des notifications par courriel */}
				<FormField
					name="push"
					control={form.control}
					render={( { field } ) => (
						<FormItem
							className={`-mx-2 mb-2 flex items-center space-y-0 rounded-md border p-4 transition-opacity ${
								!push ? "opacity-50" : ""
							}`}
						>
							<Mail className="max-sm:hidden" />

							<div className="flex-1 sm:ml-4">
								<FormLabel className="text-sm font-medium leading-none">
									Notifications par courriel
								</FormLabel>

								<FormDescription className="text-sm text-muted-foreground">
									Envoyer chaque notification par courriel en
									plus de les afficher sur le site Internet.
								</FormDescription>
							</div>

							<input
								// Support des actions de serveur pour NextJS.
								// https://github.com/react-hook-form/react-hook-form/pull/11061
								type="hidden"
								name="push"
								value={field.value ? "on" : "off"}
							/>

							<FormControl>
								<Switch
									checked={field.value}
									disabled={loading || !push}
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
						<FormItem>
							<input
								// Support des actions de serveur pour NextJS.
								// https://github.com/react-hook-form/react-hook-form/pull/11061
								type="hidden"
								name="level"
								value={field.value}
							/>

							<FormControl>
								<div className="grid gap-2">
									<Button
										{...field}
										type="button"
										variant={
											field.value === "all"
												? "secondary"
												: "ghost"
										}
										onClick={() =>
										{
											form.setValue( "level", "all" );
											setPush( true );
										}}
										disabled={loading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<BellPlus className="w-auto max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Toutes les notifications
											</h4>

											<p className="text-sm text-muted-foreground">
												Recevez l&lsquo;intégralité des
												notifications concernant la
												gestion de vos fichiers par des
												tiers ou des avertissements de
												sécurité.
											</p>
										</div>
									</Button>

									<Button
										{...field}
										type="button"
										variant={
											field.value === "necessary"
												? "secondary"
												: "ghost"
										}
										onClick={() =>
										{
											form.setValue( "level", "necessary" );
											setPush( true );
										}}
										disabled={loading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<BellMinus className="max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Seulement les notifications
												nécessaires
											</h4>

											<p className="text-sm text-muted-foreground">
												Recevez seulement les
												notifications importantes
												concernant la gestion de vos
												fichiers par des tiers.
											</p>
										</div>
									</Button>

									<Button
										{...field}
										type="button"
										variant={
											field.value === "off"
												? "secondary"
												: "ghost"
										}
										onClick={() =>
										{
											form.setValue( "level", "off" );
											form.setValue( "push", false );
											setPush( false );
										}}
										disabled={loading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<BellOff className="max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Aucune notification
											</h4>

											<p className="text-sm text-muted-foreground">
												Ne recevez aucune notification
												sauf les alertes de sécurité
												importantes.
											</p>
										</div>
									</Button>
								</div>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={loading} className="max-sm:w-full">
					{loading ? (
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