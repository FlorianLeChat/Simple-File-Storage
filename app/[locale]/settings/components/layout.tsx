//
// Composant de paramétrage de l'apparence du site.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/layout";
import { Check,
	SunMoon,
	Loader2,
	CaseUpper,
	RefreshCw,
	Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { fonts } from "@/config/fonts";
import { merge } from "@/utilities/tailwind";
import { colors } from "@/config/colors";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import type { Session } from "next-auth";
import { useState,
	useEffect,
	useActionState,
	startTransition,
	type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { valibotResolver } from "@hookform/resolvers/valibot";

import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
import { Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider } from "../../components/ui/tooltip";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { updateLayout } from "../actions/update-layout";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

export default function Layout( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "form" );
	const [ isLoading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useActionState( updateLayout, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<v.InferOutput<typeof schema>>( {
		resolver: valibotResolver( schema ),
		defaultValues: {
			font: session.user.preferences
				.font as ( typeof fonts )[number]["value"],
			color: session.user.preferences
				.color as ( typeof colors )[number]["name"],
			theme: session.user.preferences.theme as "light" | "dark"
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

		// On affiche enfin une notification avec la raison fournie
		//  avant de mettre à jour les attributs HTML en cas de succès.
		if ( success )
		{
			const element = document.documentElement;
			element.style.colorScheme = form.getValues( "theme" );
			element.className = `${ form.getValues( "font" ) } ${ form.getValues(
				"color"
			) } ${ form.getValues( "theme" ) }`;

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
				action={async ( formData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Récupération des données du formulaire.
					formData.append( "color", form.getValues( "color" ) );
					formData.append( "theme", form.getValues( "theme" ) );

					// Exécution de l'action côté serveur.
					startTransition( () =>
					{
						serverAction( updateAction, formData );
					} );
				}}
				className="space-y-8"
			>
				{/* Police de caractère */}
				<FormField
					name="font"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<CaseUpper className="mr-2 inline size-6" />
								{messages( "fields.font_label" )}
							</FormLabel>

							<Select
								{...field}
								disabled={isLoading}
								defaultValue={field.value}
								onValueChange={field.onChange}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>

								<SelectContent>
									{fonts.map( ( value ) => (
										<SelectItem
											key={value.value}
											value={value.value}
										>
											{value.label}
										</SelectItem>
									) )}
								</SelectContent>
							</Select>

							<FormDescription>
								{messages( "fields.font_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Couleurs */}
				<FormField
					name="color"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel className="!block">
								<Paintbrush className="mr-2 inline size-6" />
								{messages( "fields.color_label" )}
							</FormLabel>

							<TooltipProvider>
								{colors.map( ( value ) => (
									<Tooltip key={value.name}>
										<FormControl>
											<TooltipTrigger
												{...field}
												type="button"
												title={
													value.name
														.charAt( 0 )
														.toUpperCase()
													+ value.name.slice( 1 )
												}
												style={
													{
														"--theme-primary": `hsl(${ value.dark })`
													} as CSSProperties
												}
												onClick={() =>
												{
													field.onChange( value.name );
												}}
												disabled={isLoading}
												className={merge(
													"relative inline-flex h-9 w-9 flex-col items-center justify-center rounded-full border-2 text-xs",
													field.value === value.name
														? "relative bottom-1 border-[--theme-primary]"
														: "border-transparent"
												)}
												aria-label={
													value.name
														.charAt( 0 )
														.toUpperCase()
													+ value.name.slice( 1 )
												}
											>
												<span className="flex size-6 items-center justify-center rounded-full bg-[--theme-primary]">
													{field.value
														=== value.name && (
														<Check className="size-4 text-white" />
													)}
												</span>
											</TooltipTrigger>
										</FormControl>

										<TooltipContent
											align="center"
											className="rounded-lg bg-zinc-900 text-zinc-50"
										>
											{value.name
												.charAt( 0 )
												.toUpperCase()
												+ value.name.slice( 1 )}
										</TooltipContent>
									</Tooltip>
								) )}
							</TooltipProvider>

							<FormDescription>
								{messages( "fields.color_description" )}
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Thème */}
				<FormField
					name="theme"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="space-y-1">
							<FormLabel>
								<SunMoon className="mr-2 inline size-6" />
								{messages( "fields.theme_label" )}
							</FormLabel>

							<FormDescription>
								{messages( "fields.theme_description" )}
							</FormDescription>

							<FormMessage />

							<RadioGroup
								value={field.value}
								disabled={isLoading}
								className="grid grid-cols-1 gap-8 pt-2 sm:max-w-md sm:grid-cols-2"
								onValueChange={field.onChange}
							>
								<FormItem className="relative !inline [&:has([data-state=checked])>div]:border-primary [&:hover>div:first-child]:bg-accent [&:hover>div:first-child]:text-accent-foreground">
									<div className="items-center rounded-md border-2 border-muted bg-popover p-1">
										<ul className="space-y-2 rounded-sm bg-[#ecedef] p-2">
											<li className="space-y-2 rounded-md bg-white p-2 shadow-sm">
												<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
												<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
												<div className="size-4 rounded-full bg-[#ecedef]" />
												<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
												<div className="size-4 rounded-full bg-[#ecedef]" />
												<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
											</li>
										</ul>
									</div>

									<div className="!mt-2 flex items-center justify-center gap-2">
										<FormControl>
											<RadioGroupItem
												id="light"
												value="light"
												onClick={() =>
												{
													field.onChange( "light" );
												}}
											/>
										</FormControl>

										<p className="text-sm font-normal">
											{messages(
												"fields.theme_light_title"
											)}
										</p>
									</div>

									<FormLabel
										htmlFor="light"
										className="sr-only left-0 top-0 size-full text-transparent [clip:unset]"
									>
										{messages( "fields.theme_light_title" )}
									</FormLabel>

									<FormDescription className="sr-only">
										{messages(
											"fields.theme_light_description"
										)}
									</FormDescription>
								</FormItem>

								<FormItem className="relative !inline [&:has([data-state=checked])>div]:border-primary [&:hover>div:first-child]:bg-accent [&:hover>div:first-child]:text-accent-foreground">
									<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
										<ul className="space-y-2 rounded-sm bg-slate-950 p-2">
											<li className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
												<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
												<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
												<div className="size-4 rounded-full bg-slate-400" />
												<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
												<div className="size-4 rounded-full bg-slate-400" />
												<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
											</li>
										</ul>
									</div>

									<div className="!mt-2 flex items-center justify-center gap-2">
										<FormControl>
											<RadioGroupItem
												id="dark"
												value="dark"
												onClick={() =>
												{
													field.onChange( "dark" );
												}}
											/>
										</FormControl>

										<p className="text-sm font-normal">
											{messages(
												"fields.theme_dark_title"
											)}
										</p>
									</div>

									<FormLabel
										htmlFor="dark"
										className="sr-only left-0 top-0 size-full text-transparent [clip:unset]"
									>
										{messages( "fields.theme_dark_title" )}
									</FormLabel>

									<FormDescription className="sr-only">
										{messages(
											"fields.theme_dark_description"
										)}
									</FormDescription>
								</FormItem>
							</RadioGroup>
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