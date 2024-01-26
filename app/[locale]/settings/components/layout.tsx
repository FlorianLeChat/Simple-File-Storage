//
// Composant de paramétrage de l'apparence du site.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/layout";
import { Check,
	SunMoon,
	Loader2,
	CaseUpper,
	RefreshCw,
	Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect, type CSSProperties } from "react";

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
import { updateLayout } from "../layout/actions";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

// Déclaration des polices de caractères disponibles.
const fonts = [
	{ label: "Inter", value: "inter" },
	{ label: "Poppins", value: "poppins" },
	{ label: "Roboto", value: "roboto" }
] as const;

// Déclaration des couleurs disponibles.
const colors = [
	{
		name: "zinc",
		light: "240 5.9% 10%",
		dark: "240 5.2% 33.9%"
	},
	{
		name: "slate",
		light: "215.4 16.3% 46.9%",
		dark: "215.3 19.3% 34.5%"
	},
	{
		name: "stone",
		light: "25 5.3% 44.7%",
		dark: "33.3 5.5% 32.4%"
	},
	{
		name: "gray",
		light: "220 8.9% 46.1%",
		dark: "215 13.8% 34.1%"
	},
	{
		name: "neutral",
		light: "0 0% 45.1%",
		dark: "0 0% 32.2%"
	},
	{
		name: "red",
		light: "0 72.2% 50.6%",
		dark: "0 72.2% 50.6%"
	},
	{
		name: "rose",
		light: "346.8 77.2% 49.8%",
		dark: "346.8 77.2% 49.8%"
	},
	{
		name: "orange",
		light: "24.6 95% 53.1%",
		dark: "20.5 90.2% 48.2%"
	},
	{
		name: "green",
		light: "142.1 76.2% 36.3%",
		dark: "142.1 70.6% 45.3%"
	},
	{
		name: "blue",
		light: "221.2 83.2% 53.3%",
		dark: "217.2 91.2% 59.8%"
	},
	{
		name: "yellow",
		light: "47.9 95.8% 53.1%",
		dark: "47.9 95.8% 53.1%"
	},
	{
		name: "violet",
		light: "262.1 83.3% 57.8%",
		dark: "263.4 70% 50.4%"
	}
] as const;

export default function Layout( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateLayout, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
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

			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère également une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On met à jour après les attributs du document HTML pour
		//  refléter les changements.
		if ( success )
		{
			const element = document.documentElement;
			element.style.colorScheme = form.getValues( "theme" );
			element.className = `${ form.getValues( "font" ) } ${ form.getValues(
				"color"
			) } ${ form.getValues( "theme" ) }`;
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
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
		}
	}, [ form, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={async () =>
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
					const formData = new FormData();
					formData.append( "font", form.getValues( "font" ) );
					formData.append( "color", form.getValues( "color" ) );
					formData.append( "theme", form.getValues( "theme" ) );

					// Exécution de l'action côté serveur.
					return serverAction( updateAction, formData );
				}}
				className="space-y-8"
			>
				{/* Police de caractère */}
				<FormField
					name="font"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="font">
								<CaseUpper className="mr-2 inline h-6 w-6" />
								Police de caractères
							</FormLabel>

							<FormControl>
								<Select
									{...field}
									disabled={loading}
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="font"
										aria-controls="font"
									>
										<SelectValue />
									</SelectTrigger>

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
							</FormControl>

							<FormDescription>
								Définissez la police que vous souhaitez utiliser
								sur l&lsquo;ensemble des pages du site.
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
								<Paintbrush className="mr-2 inline h-6 w-6" />
								Couleurs
							</FormLabel>

							<FormControl>
								<TooltipProvider>
									{colors.map( ( value ) => (
										<Tooltip key={value.name}>
											<TooltipTrigger
												{...field}
												type="button"
												style={
													{
														"--theme-primary": `hsl(${ value.dark })`
													} as CSSProperties
												}
												onClick={() =>
												{
													field.onChange( value.name );
												}}
												disabled={loading}
												className={merge(
													"relative inline-flex h-9 w-9 flex-col items-center justify-center rounded-full border-2 text-xs",
													field.value === value.name
														? "relative bottom-1 border-[--theme-primary]"
														: "border-transparent"
												)}
											>
												<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--theme-primary]">
													{field.value
														=== value.name && (
														<Check className="h-4 w-4 text-white" />
													)}
												</span>

												<span className="sr-only">
													{value.name
														.charAt( 0 )
														.toUpperCase()
														+ value.name.slice( 1 )}
												</span>
											</TooltipTrigger>

											<TooltipContent
												align="center"
												className="rounded-[0.5rem] bg-zinc-900 text-zinc-50"
											>
												{value.name
													.charAt( 0 )
													.toUpperCase()
													+ value.name.slice( 1 )}
											</TooltipContent>
										</Tooltip>
									) )}
								</TooltipProvider>
							</FormControl>

							<FormDescription>
								Définissez la couleur que vous souhaitez
								utiliser sur l&lsquo;ensemble des éléments du
								site.
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
							<FormLabel htmlFor="theme">
								<SunMoon className="mr-2 inline h-6 w-6" />
								Thème
							</FormLabel>

							<FormDescription>
								Définissez le thème que vous souhaitez utiliser
								sur l&lsquo;ensemble des pages du site.
							</FormDescription>

							<FormMessage />

							<RadioGroup
								value={field.value}
								disabled={loading}
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
												<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
												<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
												<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
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

										<span className="text-sm font-normal">
											Clair
										</span>
									</div>

									<FormLabel
										htmlFor="light"
										className="sr-only left-0 top-0 h-full w-full text-transparent [clip:unset]"
									>
										Clair
									</FormLabel>

									<FormDescription className="sr-only">
										Le thème clair adapté à la lecture en
										milieu lumineux.
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
												<div className="h-4 w-4 rounded-full bg-slate-400" />
												<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
											</li>

											<li className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
												<div className="h-4 w-4 rounded-full bg-slate-400" />
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

										<span className="text-sm font-normal">
											Sombre
										</span>
									</div>

									<FormLabel
										htmlFor="dark"
										className="sr-only left-0 top-0 h-full w-full text-transparent [clip:unset]"
									>
										Sombre
									</FormLabel>

									<FormDescription className="sr-only">
										Le thème sombre adapté à la lecture en
										milieu sombre.
									</FormDescription>
								</FormItem>
							</RadioGroup>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={loading} className="max-sm:w-full">
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Veuillez patienter...
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