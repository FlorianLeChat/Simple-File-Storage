//
// Composant de paramétrage du profil utilisateur.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/profile";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { Trash,
	AtSign,
	Loader2,
	RefreshCw,
	WholeWord,
	FileImage,
	PlusCircleIcon } from "lucide-react";

import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/use-toast";
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
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { Button, buttonVariants } from "../../components/ui/button";

export default function Profile( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			email: session.user?.email ?? "",
			username: session.user?.name ?? session.user?.id
		}
	} );

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
								Ceci est votre pseudonyme unique, il peut
								s&lsquo;agir de votre nom réel ou d&lsquo;un
								pseudonyme. Vous ne pouvez le changer
								qu&lsquo;une fois tous les 30 jours. Personne ne
								peut le voir sauf vous.
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

							<FormControl
								className={session.user.oauth ? "hidden" : ""}
							>
								<div className="flex gap-2 max-sm:flex-wrap">
									<TooltipProvider>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												id="email"
												aria-controls="email"
											>
												<SelectValue />
											</SelectTrigger>

											<SelectContent>
												<SelectItem value={field.value}>
													{field.value}
												</SelectItem>
											</SelectContent>
										</Select>

										<Tooltip>
											<TooltipTrigger
												type="button"
												disabled={isLoading}
												className={buttonVariants( {
													size: "icon",
													variant: "outline"
												} )}
											>
												<PlusCircleIcon className="h-4 w-4" />
											</TooltipTrigger>

											<TooltipContent>
												Ajouter une adresse électronique
											</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger
												type="button"
												disabled={isLoading}
												className={buttonVariants( {
													size: "icon",
													variant: "outline"
												} )}
											>
												<Trash className="h-4 w-4" />
											</TooltipTrigger>

											<TooltipContent>
												Supprimer cette adresse
												électronique
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</FormControl>

							{session.user.oauth ? (
								<FormDescription className="font-extrabold text-destructive">
									Ce paramètre ne peut pas être modifié en
									raison de l&lsquo;utilisation d&lsquo;un
									fournisseur d&lsquo;authentification externe
									pour vous connecter au site.
								</FormDescription>
							) : (
								<FormDescription>
									Ceci est la liste des adresses électroniques
									associées à votre compte. Vous pouvez en
									ajouter ou en supprimer à tout moment.
									Chacune de ses adresses électroniques peut
									être utilisée pour vous connecter au site.
								</FormDescription>
							)}

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
									accept=".png,.jpg,.jpeg"
									disabled={isLoading}
									onChange={( event ) => field.onChange(
										event.target.files
												&& event.target.files[ 0 ]
									)}
									className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
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