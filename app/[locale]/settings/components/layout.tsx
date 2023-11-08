//
// Composant de paramétrage de l'apparence du site.
//

"use client";

import * as z from "zod";
import { Check,
	SunMoon,
	Loader2,
	CaseUpper,
	RefreshCw,
	Paintbrush } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, type CSSProperties } from "react";

import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
import { useLayout } from "../../components/layout-provider";
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

// Déclaration du schéma de validation du formulaire.
const layoutForm = z.object( {
	font: z.enum( [ "inter", "poppins", "roboto" ] ),
	theme: z.enum( [ "light", "dark" ] ),
	color: z.enum( [
		"zinc",
		"slate",
		"stone",
		"gray",
		"neutral",
		"red",
		"rose",
		"orange",
		"green",
		"blue",
		"yellow",
		"violet"
	] )
} );

export default function Layout()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );
	const { font, theme, color, setFont, setTheme, setColor } = useLayout();

	// Mise à jour des informations.
	const updateLayout = ( data: z.infer<typeof layoutForm> ) =>
	{
		setIsLoading( true );

		setFont( data.font );
		setTheme( data.theme );
		setColor( data.color );

		setTimeout( () =>
		{
			toast( {
				title: "Vous avez soumis les informations suivantes :",
				description: (
					<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
						<code className="text-white">
							{JSON.stringify( data, null, 4 )}
						</code>
					</pre>
				)
			} );

			setIsLoading( false );
		}, 3000 );
	};

	// Définition du formulaire.
	const form = useForm<z.infer<typeof layoutForm>>( {
		resolver: zodResolver( layoutForm ),
		defaultValues: {
			font: "inter",
			color: "blue",
			theme: "light"
		}
	} );

	// Mise à jour de l'état de montage du composant.
	//  Source : https://www.npmjs.com/package/next-themes#avoid-hydration-mismatch
	useEffect( () =>
	{
		form.setValue( "font", font as "inter" );
		form.setValue( "theme", theme as "light" );
		form.setValue( "color", color as "blue" );
	}, [ form, font, theme, color ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit( updateLayout )}
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
									value={field.value}
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

													form.handleSubmit(
														updateLayout
													);
												}}
												disabled={isLoading}
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

													form.handleSubmit(
														updateLayout
													);
												}}
												disabled={isLoading}
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

													form.handleSubmit(
														updateLayout
													);
												}}
												disabled={isLoading}
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
				<Button disabled={isLoading} className="max-sm:w-full">
					{isLoading ? (
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