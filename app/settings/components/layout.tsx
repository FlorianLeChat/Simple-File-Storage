//
// Composant de paramétrage de l'apparence du site.
//

"use client";

import * as z from "zod";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";

import { toast } from "../../components/ui/use-toast";
import { Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage } from "../../components/ui/form";
import { Button, buttonVariants } from "../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

// Déclaration du schéma de validation du formulaire.
const layoutForm = z.object( {
	font: z.enum( [ "inter", "manrope", "system" ] ),
	theme: z.enum( [ "light", "dark" ] )
} );

export default function Layout()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const updateLayout = ( data: z.infer<typeof layoutForm> ) =>
	{
		setIsLoading( true );

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
			theme: "light"
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
							<FormLabel>Police de caractère</FormLabel>

							<div className="relative w-max">
								<FormControl>
									<select
										className={merge(
											buttonVariants( {
												variant: "outline"
											} ),
											"w-[200px] appearance-none bg-transparent font-normal"
										)}
										{...field}
									>
										<option value="inter">Inter</option>
										<option value="poppins">Poppins</option>
										<option value="system">System</option>
									</select>
								</FormControl>

								<ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
							</div>

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
							<FormLabel>Thème</FormLabel>

							<FormDescription>
								Définissez le thème que vous souhaitez utiliser
								sur l&lsquo;ensemble des pages du site.
							</FormDescription>

							<FormMessage />

							<RadioGroup
								className="grid max-w-md grid-cols-2 gap-8 pt-2"
								defaultValue={field.value}
								onValueChange={field.onChange}
							>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem
												value="light"
												className="sr-only"
											/>
										</FormControl>

										<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
											<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
												<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>

												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>

												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
											</div>
										</div>

										<span className="block w-full p-2 text-center font-normal">
											Clair
										</span>
									</FormLabel>
								</FormItem>

								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem
												value="dark"
												className="sr-only"
											/>
										</FormControl>

										<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
											<div className="space-y-2 rounded-sm bg-slate-950 p-2">
												<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>

												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>

												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
											</div>
										</div>

										<span className="block w-full p-2 text-center font-normal">
											Sombre
										</span>
									</FormLabel>
								</FormItem>
							</RadioGroup>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="mr-2 h-4 w-4" />
					)}
					Mettre à jour
				</Button>
			</form>
		</Form>
	);
}