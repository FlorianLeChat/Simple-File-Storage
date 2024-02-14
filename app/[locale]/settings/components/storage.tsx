//
// Composant de paramétrage du stockage.
//

"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { useFormState } from "react-dom";
import type { Session } from "next-auth";
import { useState, useEffect } from "react";
import { Globe, Link2, RefreshCw, Loader2, History } from "lucide-react";

import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Form,
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormDescription } from "../../components/ui/form";
import { updateStorage } from "../storage/actions";

export default function Storage( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const [ loading, setLoading ] = useState( false );
	const [ updateState, updateAction ] = useFormState( updateStorage, {
		success: true,
		reason: ""
	} );

	// Déclaration du formulaire.
	const form = useForm( {
		defaultValues: {
			public: session.user.preferences.public,
			extension: session.user.preferences.extension,
			versions: session.user.preferences.versions
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

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason } = updateState;

		if ( reason === "" )
		{
			return;
		}

		// On informe après qu'une réponse a été reçue.
		setLoading( false );

		// On affiche enfin une notification avec la raison fournie.
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
	}, [ form, updateState ] );

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
					return serverAction( updateAction, formData );
				}}
				className="space-y-8"
			>
				{/* Mettre les fichiers en public */}
				<FormField
					name="public"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="public">
								<Globe className="mr-2 inline h-6 w-6" />
								Publication des fichiers
							</FormLabel>

							<FormDescription>
								Par défaut, les fichiers téléversés sur le
								serveur sont privés et ne sont pas accessibles
								aux autres utilisateurs. Si vous activez cette
								option,{" "}
								<strong>
									les nouveaux fichiers seront automatiquement
									publiés et accessibles à tous les
									utilisateurs disposant du lien d&lsquo;accès
								</strong>
								.
							</FormDescription>

							<FormControl>
								<div className="flex items-center space-x-2">
									<Switch
										id="public"
										name="public"
										checked={field.value}
										disabled={loading}
										onCheckedChange={field.onChange}
									/>

									<Label
										htmlFor="public"
										className="leading-5"
									>
										Activer la publication automatique des
										fichiers téléversés sur le serveur
									</Label>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Affichage des extensions */}
				<FormField
					name="extension"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="extension">
								<Link2 className="mr-2 inline h-6 w-6" />
								Affichage des extensions
							</FormLabel>

							<FormDescription>
								Pour faciliter le partage des fichiers, le lien
								d&lsquo;accès est généré de manière à ce que
								l&lsquo;extension du fichier ne soit pas
								visible. Si vous activez cette option,{" "}
								<strong>
									l&lsquo;extension sera affichée dans le lien
									d&lsquo;accès
								</strong>
								. Cela peut être utile lorsque vous utilisez des
								fichiers multimédias (comme des vidéos ou des
								musiques) sur des lecteurs anciens.
							</FormDescription>

							<FormControl>
								<div className="flex items-center space-x-2">
									<Switch
										id="extension"
										name="extension"
										checked={field.value}
										disabled={loading}
										onCheckedChange={field.onChange}
									/>

									<Label
										htmlFor="account"
										className="leading-5"
									>
										Afficher les extensions des fichiers
										dans le lien d&lsquo;accès
									</Label>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Enregistrement des anciennes versions */}
				<FormField
					name="versions"
					control={form.control}
					render={( { field } ) => (
						<FormItem>
							<FormLabel htmlFor="versions">
								<History className="mr-2 inline h-6 w-6" />
								Enregistrement des anciennes versions
							</FormLabel>

							<FormDescription>
								Lorsque vous téléversez un fichier portant le
								même nom qu&lsquo;un fichier déjà présent dans
								votre espace de stockage, le fichier existant
								est remplacé par le nouveau. Si vous activez
								cette option,{" "}
								<strong>
									les anciennes versions des fichiers seront
									automatiquement enregistrées
								</strong>{" "}
								et pourront être restaurées à tout moment.
								<br />
								<br />
								<em>
									Note : cette option peut augmenter
									significativement la consommation de votre
									espace de stockage. Si cette option était
									précédemment activée, la désactivation aura
									pour effet de supprimer toutes les anciennes
									versions des fichiers.
								</em>
							</FormDescription>

							<FormControl>
								<div className="flex items-center space-x-2">
									<Switch
										id="versions"
										name="versions"
										checked={field.value}
										disabled={loading}
										onCheckedChange={field.onChange}
									/>

									<Label
										htmlFor="versions"
										className="leading-5"
									>
										Enregistrer automatiquement les
										anciennes versions des fichiers
									</Label>
								</div>
							</FormControl>
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