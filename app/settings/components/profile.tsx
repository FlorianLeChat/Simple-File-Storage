//
// Composant de paramétrage du profil utilisateur.
//

"use client";

import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, WholeWord, AtSign, FileImage } from "lucide-react";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger } from "../../components/ui/select";

// Déclaration du schéma de validation du formulaire.
const schema = z.object( {
	username: z.string().min( 10 ).max( 50 ),
	email: z.string().min( 10 ).max( 100 ).email(),
	avatar: z.any().optional()
} );

export default function Profile()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Mise à jour des informations.
	const updateProfile = ( data: z.infer<typeof schema> ) =>
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
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			email: "florian@gmail.com",
			username: "florian4016"
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit( updateProfile )}
				className="space-y-8"
			>
				{/* Nom d'utilisateur */}
				<FormField
					name="username"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel>
								<WholeWord className="mr-2 inline h-6 w-6" />
								Nom d&lsquo;utilisateur
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									disabled={isLoading}
									minLength={
										schema.shape.username
											.minLength as number
									}
									maxLength={
										schema.shape.username
											.maxLength as number
									}
									spellCheck="false"
									placeholder="john-doe"
									autoComplete="username"
									autoCapitalize="off"
								/>
							</FormControl>

							<FormDescription>
								Ceci est votre pseudonyme unique. Il peut
								s&lsquo;agir de votre nom réel ou d&lsquo;un
								pseudonyme. Vous ne pouvez le changer
								qu&lsquo;une fois tous les 30 jours.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Adresse électronique */}
				<FormField
					name="email"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="email">
								<AtSign className="mr-2 inline h-6 w-6" />
								Adresse électronique
							</FormLabel>

							<FormControl>
								<Select
									defaultValue={field.value}
									onValueChange={field.onChange}
								>
									<SelectTrigger
										id="email"
										aria-controls="email"
									>
										<SelectValue placeholder="Sélectionner une adresse électronique vérifiée à afficher" />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="florian@gmail.com">
											florian@gmail.com
										</SelectItem>

										<SelectItem value="florian@hotmail.com">
											florian@hotmail.com
										</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>

							<FormDescription>
								Vous pouvez ajouter ou supprimer des adresses
								électroniques à partir de vos{" "}
								<Link href="/settings/account">
									paramètres de compte utilisateur
								</Link>
								.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Avatar */}
				<FormField
					name="avatar"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="email">
								<FileImage className="mr-2 inline h-6 w-6" />
								Avatar
							</FormLabel>

							<FormControl>
								<Input
									{...field}
									type="file"
									accept="image/*"
									disabled={isLoading}
								/>
							</FormControl>

							<FormDescription>
								Vous pouvez mettre à jour l&lsquo;avatar utilisé
								pour votre compte utilisateur.{" "}
								<strong>
									Les avatars ne doivent pas dépasser 2 Mo et
									doivent être au format PNG ou JPEG.
								</strong>
							</FormDescription>

							<FormMessage />
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