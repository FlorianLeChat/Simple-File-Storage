//
// Composant de paramétrage des notifications.
//

"use client";

import * as z from "zod";
import schema from "@/schemas/notifications";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, Bell, User2, EyeOff, Mail } from "lucide-react";

import { toast } from "../../components/ui/use-toast";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";

export default function Notifications()
{
	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Déclaration du formulaire.
	const form = useForm<z.infer<typeof schema>>( {
		resolver: zodResolver( schema ),
		defaultValues: {
			push: false,
			level: "all"
		}
	} );

	// Mise à jour des informations.
	const updateNotifications = ( data: z.infer<typeof schema> ) =>
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
				onSubmit={form.handleSubmit( updateNotifications )}
				className="space-y-6"
			>
				{/* Activation des notifications par courriel */}
				<FormField
					name="push"
					control={form.control}
					render={( { field } ) => (
						<FormItem className="-mx-2 mb-2 flex items-center space-x-4 space-y-0 rounded-md border p-4">
							<Mail />

							<div className="flex-1">
								<FormLabel className="text-sm font-medium leading-none">
									Notifications par courriel
								</FormLabel>

								<FormDescription className="text-sm text-muted-foreground">
									Envoyer chaque notification par courriel en
									plus de les afficher sur le site Internet.
								</FormDescription>
							</div>

							<FormControl>
								<Switch
									checked={field.value}
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
										onClick={() => form.setValue( "level", "all" )}
										disabled={isLoading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<Bell className="h-9 w-auto max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Toutes les notifications
											</h4>

											<p className="text-sm text-muted-foreground">
												Recevez une notification à
												chaque téléchargement de vos
												fichiers et à chaque fois que
												votre fichier est modifié par un
												autre utilisateur autorisé.
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
										onClick={() => form.setValue( "level", "necessary" )}
										disabled={isLoading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<User2 className="max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Seulement les notifications
												nécessaires
											</h4>

											<p className="text-sm text-muted-foreground">
												Recevez une notification
												seulement lorsqu&lsquo;un
												fichier partagé avec tiers est
												supprimé.
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
										onClick={() => form.setValue( "level", "off" )}
										disabled={isLoading}
										className="-mx-2 h-auto justify-normal gap-4 p-3 text-left"
									>
										<EyeOff className="max-sm:hidden" />

										<div>
											<h4 className="mb-2 text-sm font-medium leading-none sm:mb-1">
												Aucune notification
											</h4>

											<p className="text-sm text-muted-foreground">
												Ne recevez aucune notification
												sauf en cas de problème avec
												votre compte.
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