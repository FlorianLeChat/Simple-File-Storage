//
// Composant de paramétrage de l'apparence du site.
//

"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { CaseUpper, Loader2, SunMoon, RefreshCw } from "lucide-react";

import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";
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
	{ label: "Système", value: "system" }
] as const;

// Déclaration du schéma de validation du formulaire.
const layoutForm = z.object( {
	font: z.enum( [ "inter", "poppins", "system" ] ),
	theme: z.enum( [ "light", "dark" ] )
} );

export default function Layout()
{
	// Déclaration des variables d'état.
	const { theme, setTheme } = useTheme();
	const [ mounted, setMounted ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const updateLayout = ( data: z.infer<typeof layoutForm> ) =>
	{
		setIsLoading( true );

		setTheme( data.theme );

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

	// Mise à jour de l'état de montage du composant.
	//  Source : https://www.npmjs.com/package/next-themes#avoid-hydration-mismatch
	useEffect( () =>
	{
		setMounted( true );
	}, [] );

	// Définition du formulaire.
	const form = useForm<z.infer<typeof layoutForm>>( {
		resolver: zodResolver( layoutForm ),
		defaultValues: {
			font: "inter"
		}
	} );

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
								Police de caractère
							</FormLabel>

							<FormControl>
								<Select
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
										{fonts.map( ( font ) => (
											<SelectItem
												key={font.value}
												value={font.value}
											>
												{font.label}
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
								id="theme"
								value={
									( field.value && field.value )
									|| ( mounted ? theme : "light" )
								}
								className="grid max-w-md grid-cols-2 gap-8 pt-2"
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
				<Button disabled={isLoading}>
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