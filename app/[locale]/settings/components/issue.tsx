//
// Composant de signalement des bogues.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/issue";
import { toast } from "sonner";
import { List,
	Send,
	Globe,
	Loader2,
	Subtitles,
	ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/server-action";
import { useTranslations } from "next-intl";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect, useActionState } from "react";

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

export default function Issue()
{
	// Déclaration du formulaire.
	const form = useForm<v.InferOutput<typeof schema>>( {
		resolver: valibotResolver( schema ),
		defaultValues: {
			area: "account",
			subject: "",
			severity: "low",
			description: ""
		}
	} );

	// Méthode passerelle pour la création d'un signalement.
	const proxyCreateIssue = async ( lastState: Record<string, unknown>, formData: FormData ) =>
	{
		const state = await form.trigger();

		if ( !state )
		{
			return;
		}

		return serverAction( createIssue, lastState, formData );
	};

	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ updateState, updateAction, isPending ] = useActionState( proxyCreateIssue, {
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

		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			form.reset();

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
				{/* Domaine touché */}
				<FormField
					name="area"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="sm:inline-block sm:w-[calc(100%-160px-1rem)]">
							<FormLabel>
								<Globe className="mr-2 inline size-6" />
								{messages( "fields.domain_label" )}
							</FormLabel>

							<Select
								{...field}
								disabled={isPending}
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
										{messages( "fields.domain_account" )}
									</SelectItem>

									<SelectItem value="upload">
										{messages( "fields.domain_upload" )}
									</SelectItem>

									<SelectItem value="sharing">
										{messages( "fields.domain_sharing" )}
									</SelectItem>

									<SelectItem value="other">
										{messages( "fields.domain_other" )}
									</SelectItem>
								</SelectContent>
							</Select>

							<FormDescription className="sr-only">
								{messages( "fields.domain_description" )}
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
								<ShieldAlert className="mr-2 inline size-6" />
								{messages( "fields.severity_label" )}
							</FormLabel>

							<Select
								{...field}
								disabled={isPending}
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
										{messages( "fields.severity_critical" )}
									</SelectItem>

									<SelectItem value="high">
										{messages( "fields.severity_high" )}
									</SelectItem>

									<SelectItem value="medium">
										{messages( "fields.severity_medium" )}
									</SelectItem>

									<SelectItem value="low">
										{messages( "fields.severity_low" )}
									</SelectItem>
								</SelectContent>
							</Select>

							<FormDescription className="sr-only">
								{messages( "fields.severity_description" )}
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
								<List className="mr-2 inline size-6" />
								{messages( "fields.subject_label" )}
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isPending}
									maxLength={
										schema.entries.subject.pipe[ 2 ]
											.requirement
									}
									placeholder={messages(
										"fields.subject_placeholder"
									)}
								/>
							</FormControl>

							<FormDescription className="sr-only">
								{messages( "fields.subject_description" )}
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
								<Subtitles className="mr-2 inline size-6" />
								{messages( "fields.description_label" )}
							</FormLabel>

							<FormControl>
								<Textarea
									{...field}
									disabled={isPending}
									maxLength={
										schema.entries.description.pipe[ 2 ]
											.requirement
									}
									className="max-h-[150px]"
									placeholder={messages(
										"fields.description_placeholder"
									)}
								/>
							</FormControl>

							<FormDescription className="sr-only">
								{messages( "fields.description_description" )}
							</FormDescription>

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
							<Send className="mr-2 size-4" />
							{messages( "send" )}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}