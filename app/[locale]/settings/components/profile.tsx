//
// Composant de paramétrage du profil utilisateur.
//

"use client";

import schema from "@/schemas/profile";
import { AtSign,
	Loader2,
	RefreshCw,
	FileImage,
	Fingerprint } from "lucide-react";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect } from "react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { updateProfile } from "../profile/actions";

export default function Profile( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const { toast } = useToast();
	const formState = {
		success: true,
		reason: ""
	};

	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateProfile, formState );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			email: session.user.email ?? "",
			avatar: ""
		}
	} );

	// Affichage des erreurs en provenance du serveur.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !updateState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast( {
				title: "form.errors.update_failed",
				variant: "destructive",
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère également une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après une partie du formulaire
		//  en cas de succès.
		if ( success )
		{
			form.resetField( "avatar" );
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			toast( {
				title: success
					? "form.info.update_success"
					: "form.errors.update_failed",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ toast, form, updateState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={( formData ) => serverAction( updateAction, formData )}
				onSubmit={() => setLoading( true )}
				className="space-y-8"
			>
				{/* Nom d'utilisateur */}
				<FormItem>
					<FormLabel>
						<Fingerprint className="mr-2 inline h-6 w-6" />
						Identifiant unique
					</FormLabel>

					<FormControl>
						<Input value={session.user.id} disabled />
					</FormControl>

					<FormDescription>
						Ceci est votre identifiant unique, il est utilisé pour
						vous identifier sur le site et pour accéder aux
						ressources publiques qui vous sont associées.{" "}
						<strong>
							Vous pouvez demander son changement en contactant
							l&lsquo;administrateur du site.
						</strong>
					</FormDescription>

					<FormMessage />
				</FormItem>

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
								<Input
									{...field}
									disabled={loading}
									minLength={
										schema.shape.email.minLength as number
									}
									maxLength={
										schema.shape.email.maxLength as number
									}
									spellCheck="false"
									placeholder="name@example.com"
									autoComplete="email"
									autoCapitalize="off"
								/>
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
									Ceci est l&lsquo;adresse électronique
									associée à votre compte. Elle est
									indispensable pour vous connecter à votre
									compte et recevoir les notifications via
									courriel.
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
									accept={
										process.env
											.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES
									}
									disabled={loading}
									className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
								/>
							</FormControl>

							<FormDescription>
								Vous pouvez mettre à jour l&lsquo;avatar utilisé
								pour votre compte utilisateur.{" "}
								<strong>
									Les avatars ne doivent pas dépasser 5 Mo et
									doivent être au format PNG, JPEG ou WEBP.
								</strong>
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button disabled={loading} className="max-sm:w-full">
					{loading ? (
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