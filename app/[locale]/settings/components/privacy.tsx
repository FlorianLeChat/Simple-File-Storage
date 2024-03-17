//
// Composant de paramétrage de la confidentialité.
//

"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useFormState } from "react-dom";
import { useState, useEffect } from "react";
import { Files, KeyRound, Scale, Trash, Loader2 } from "lucide-react";

import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription } from "../../components/ui/form";
import { deleteUserData } from "../actions/delete-user-data";

export default function Privacy()
{
	// Déclaration des variables d'état.
	const [ isLoading, setLoading ] = useState( false );
	const [ deleteState, deleteAction ] = useFormState( deleteUserData, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			files: false,
			account: false
		}
	} );

	// Détection de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !deleteState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( "form.errors.deletion_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = deleteState;

		if ( reason === "" )
		{
			return;
		}

		// On informe après qu'une réponse a été reçue.
		setLoading( false );

		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			form.reset();

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
	}, [ form, deleteState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Form {...form}>
			<form
				action={async ( formData: FormData ) =>
				{
					// Vérifications côté client.
					const state = await form.trigger();

					if ( !state )
					{
						return false;
					}

					// Activation de l'état de chargement.
					setLoading( true );

					// Exécution de l'action côté serveur.
					return serverAction( deleteAction, formData );
				}}
				className="space-y-8"
			>
				{/* Documents légaux */}
				<FormField
					name="legal"
					render={() => (
						<FormItem>
							<Label>
								<Scale className="mr-2 inline h-6 w-6" />
								Documents légaux
							</Label>

							<ul className="list-inside list-disc text-sm text-muted-foreground underline decoration-dotted underline-offset-4">
								<li>
									<Link
										href="/legal/terms"
										className="dark:hover:text-foreground"
									>
										Consulter les conditions
										d&lsquo;utilisation (Français
										seulement).
									</Link>
								</li>

								<li>
									<Link
										href="/legal/privacy"
										className="dark:hover:text-foreground"
									>
										Consulter la politique de
										confidentialité (Français seulement).
									</Link>
								</li>
							</ul>
						</FormItem>
					)}
				/>

				{/* Fichiers utilisateur */}
				<FormField
					name="files"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<Files className="mr-2 inline h-6 w-6" />
								Fichiers utilisateur
							</FormLabel>

							<FormDescription>
								Lorsque vous téléversez un fichier sur le
								serveur, ses données sont enregistrées dans le
								système de fichiers (ou dans un système de
								stockage en nuage selon la configuration du
								site) et certaines informations sont ajoutées à
								la base de données afin de le retrouver plus
								facilement.
								<br />
								<br />
								Si vous activez cette option,{" "}
								<strong>
									seuls vos fichiers seront supprimés
									définitivement du serveur sans possibilité
									de récupération via l&lsquo;assistance
									technique.
								</strong>{" "}
								La suppression sera immédiate et inclura les
								versions antérieures ainsi que les données de
								partage à d&lsquo;autres utilisateurs.
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={field.onChange}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									Je veux supprimer mes fichiers ainsi que
									toutes les données associées définitivement
									sans possibilité de récupération via
									l&lsquo;assistance technique.
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Compte utilisateur */}
				<FormField
					name="account"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>
								<KeyRound className="mr-2 inline h-6 w-6" />
								Compte utilisateur
							</FormLabel>

							<FormDescription>
								En accédant à votre espace utilisateur, vous
								avez dû créer un compte en fournissant une
								adresse email et un mot de passe. Ces
								informations sont enregistrées dans la base de
								données et permettent de vous identifier sur le
								site. Si vous avez utilisé un fournisseur
								d&lsquo;authentification externe (comme Google
								ou GitHub), certaines données sont également
								enregistrées afin de vous identifier
								automatiquement (mais ils ne permettent pas
								d&lsquo;accéder à vos informations
								personnelles).
								<br />
								<br />
								Si vous activez cette option,{" "}
								<strong>
									l&lsquo;ensemble de votre compte sera
									supprimé définitivement du serveur sans
									possibilité de récupération via
									l&lsquo;assistance technique.
								</strong>{" "}
								La suppression sera immédiate et inclura les
								données associées à votre compte (comme les
								fichiers, les versions antérieures, les données
								de partage à d&lsquo;autres utilisateurs, les
								notifications, les signalements de bogues, les
								données de session, l&lsquo;avatar, etc.).
							</FormDescription>

							<div className="flex items-center space-x-2">
								<FormControl>
									<Switch
										id={field.name}
										name={field.name}
										checked={field.value}
										disabled={isLoading}
										onCheckedChange={( value ) =>
										{
											if ( value )
											{
												// Activation de la suppression des fichiers.
												form.setValue( "files", true );
											}

											field.onChange( value );
										}}
									/>
								</FormControl>

								<Label
									htmlFor={field.name}
									className="leading-5"
								>
									Je veux supprimer mon compte utilisateur
									ainsi que toutes les données associées
									définitivement sans possibilité de
									récupération via l&lsquo;assistance
									technique.
								</Label>
							</div>
						</FormItem>
					)}
				/>

				{/* Bouton de validation du formulaire */}
				<Button
					disabled={
						isLoading
						|| ( !form.getValues().files && !form.getValues().account )
					}
					className="max-sm:w-full"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Veuillez patienter...
						</>
					) : (
						<>
							<Trash className="mr-2 h-4 w-4" />
							Supprimer définitivement
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}