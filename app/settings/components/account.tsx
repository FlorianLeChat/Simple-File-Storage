//
// Composant de paramétrage du compte utilisateur.
//

"use client";

import * as z from "zod";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownUp, Check } from "lucide-react";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem } from "../../components/ui/command";
import { Popover,
	PopoverContent,
	PopoverTrigger } from "../../components/ui/popover";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";

const languages = [
	{ label: "English", value: "en" },
	{ label: "French", value: "fr" }
] as const;

const accountForm = z.object( {
	name: z.string().min( 2 ).max( 30 ),
	language: z.string()
} );

export default function Account()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const updateAccount = ( data: z.infer<typeof accountForm> ) =>
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
	const form = useForm<z.infer<typeof accountForm>>( {
		mode: "onChange",
		resolver: zodResolver( accountForm ),
		defaultValues: {
			name: "Florian4016",
			language: "fr"
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit( updateAccount )}
				className="space-y-8"
			>
				{/* Nom d'affichage */}
				<FormField
					name="name"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>Nom d&lsquo;affichage</FormLabel>

							<FormControl>
								<Input placeholder="Your name" {...field} />
							</FormControl>

							<FormDescription>
								This is the name that will be displayed on your
								profile and in emails.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					name="language"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="flex flex-col">
							<FormLabel>Langue</FormLabel>

							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											role="combobox"
											className={merge(
												"w-[200px] justify-between",
												!field.value
													&& "text-muted-foreground"
											)}
										>
											{field.value
												? languages.find(
													( language ) => language.value
															=== field.value
												  )?.label
												: "Select language"}
											<ArrowDownUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>

								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Search language..." />

										<CommandEmpty>
											No language found.
										</CommandEmpty>

										<CommandGroup>
											{languages.map( ( language ) => (
												<CommandItem
													value={language.label}
													key={language.value}
													onSelect={() =>
													{
														form.setValue(
															"language",
															language.value
														);
													}}
												>
													<Check
														className={merge(
															"mr-2 h-4 w-4",
															language.value
																=== field.value
																? "opacity-100"
																: "opacity-0"
														)}
													/>
													{language.label}
												</CommandItem>
											) )}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>

							<FormDescription>
								This is the language that will be used in the
								dashboard.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Update account</Button>
			</form>
		</Form>
	);
}