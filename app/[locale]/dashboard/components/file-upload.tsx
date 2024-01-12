//
// Composant de téléversement des fichiers.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import serverAction from "@/utilities/recaptcha";
import { useSession } from "next-auth/react";
import { formatSize } from "@/utilities/react-table";
import { useFormState } from "react-dom";
import { type FileAttributes } from "@/interfaces/File";
import type { Table, TableMeta } from "@tanstack/react-table";
import { Ban, Loader2, PlusCircleIcon, UploadCloud } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { useToast } from "../../components/ui/use-toast";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { uploadFiles } from "../actions";
import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { Button, buttonVariants } from "../../components/ui/button";

export default function FileUpload( {
	table
}: {
	table: Table<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const states = table.options.meta as TableMeta<FileAttributes>;
	const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA ?? 0 );

	// Déclaration des variables d'état.
	const session = useSession();
	const loading = states.loading.length !== 0;
	const { toast } = useToast();
	const [ open, setOpen ] = useState( false );
	const [ quota, setQuota ] = useState(
		states.files.reduce(
			( total, file ) => total
				+ file.versions.reduce( ( size, version ) => size + version.size, 0 ),
			0
		)
	);
	const [ uploadState, uploadAction ] = useFormState( uploadFiles, {
		success: true,
		reason: "",
		data: []
	} );

	// Déclaration du formulaire.
	const percent = Number( ( ( quota / maxQuota ) * 100 ).toFixed( 2 ) );
	const form = useForm( {
		defaultValues: {
			upload: ""
		}
	} );

	// Vérification de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !uploadState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			states.setLoading( [ "modal" ] );

			toast( {
				title: "form.errors.update_failed",
				variant: "destructive",
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason, data } = uploadState;

		// On vérifie également si le serveur a renvoyé la liste des
		//  fichiers téléversés avec succès.
		if ( data && data.length > 0 )
		{
			// Si c'est le cas, on ajoute les fichiers à la liste
			//  des fichiers déjà existants.
			const uploaded: FileAttributes[] = [];

			data.forEach( ( file ) =>
			{
				// Transformation de la chaîne JSON en objet.
				const json = JSON.parse( file ) as FileAttributes;

				// Ajout du fichier à la liste des fichiers téléversés.
				uploaded.push( {
					uuid: json.uuid,
					name: json.name,
					type: json.type,
					path: new URL( json.path, window.location.href ).href,
					status: json.status,
					versions: json.versions.map( ( version ) => ( {
						...version,
						date: new Date( version.date )
					} ) )
				} );
			} );

			// On filtre les fichiers déjà existants pour éviter
			//  les doublons avant de mettre à jour la liste des
			//  fichiers et le quota utilisateur.
			let newFiles: FileAttributes[] = [];

			states.setFiles( ( previous ) =>
			{
				newFiles = [
					...previous.filter(
						( value ) => uploaded.filter( ( file ) => file.uuid === value.uuid )
							.length === 0
					),
					...uploaded
				];

				return newFiles;
			} );

			setQuota(
				newFiles.reduce(
					( total, file ) => total
						+ file.versions.reduce(
							( size, version ) => size + version.size,
							0
						),
					0
				)
			);
		}

		// On affiche après le message correspondant si une raison
		//  a été fournie avant d'indiquer que le traitement est terminé.
		if ( reason !== "" )
		{
			uploadState.reason = "";
			uploadState.data = undefined;

			states.setLoading( [] );

			toast( {
				title: success
					? "form.info.upload_success"
					: "form.errors.upload_failed",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}

		// On réinitialise enfin une partie du formulaire en cas
		//  de succès avant de le fermer.
		if ( success )
		{
			form.reset();

			setOpen( false );
		}
	}, [ form, states, uploadState, toast ] );

	// Affichage du rendu HTML du composant.
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				className={buttonVariants( { variant: "default" } )}
				aria-controls="file-upload"
			>
				<PlusCircleIcon className="inline h-4 w-4 sm:mr-2" />

				<span id="file-upload" className="max-sm:hidden">
					Ajouter un fichier
				</span>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<UploadCloud className="mr-2 inline h-5 w-5" />

						<span className="align-middle">
							Téléversement de fichiers
						</span>
					</DialogTitle>

					<DialogDescription>
						Tous les formats de fichiers sont acceptés. La vitesse
						de téléversement dépend de votre connexion Internet et
						des capacités matérielles de votre ordinateur.{" "}
						<strong>
							Si un fichier du même nom existe déjà, il sera
							remplacé et une nouvelle révision sera créée pour
							être restaurée ultérieurement si besoin.
						</strong>
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						action={( formData ) => serverAction( uploadAction, formData )}
						onSubmit={() => states.setLoading( [ "modal" ] )}
						className="space-y-6"
					>
						<FormField
							name="upload"
							control={form.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel className="sr-only">
										Fichiers à téléverser
									</FormLabel>

									<FormControl>
										<Input
											{...field}
											type="file"
											accept={
												process.env
													.NEXT_PUBLIC_ACCEPTED_FILE_TYPES
											}
											multiple
											required
											disabled={loading}
											className="!mt-0 file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
										/>
									</FormControl>

									{session.data?.user?.role !== "admin" && (
										<>
											<Progress
												value={percent}
												className="h-1"
											/>

											<FormDescription className="!mt-1 text-sm text-muted-foreground">
												{percent.toLocaleString()}% du
												quota actuellement utilisés (
												{formatSize( quota )} /{" "}
												{formatSize( maxQuota )})
											</FormDescription>
										</>
									)}

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire */}
						<Button
							disabled={loading}
							className="float-right ml-1 max-sm:w-[calc(50%-0.25rem)] sm:ml-2"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Téléversement...
								</>
							) : (
								<>
									<PlusCircleIcon className="mr-2 h-4 w-4" />
									Téléverser
								</>
							)}
						</Button>

						{/* Bouton de fermeture du formulaire */}
						<DialogClose
							onClick={() => form.reset()}
							disabled={loading}
							className={merge(
								buttonVariants( {
									variant: "outline"
								} ),
								"float-right max-sm:mr-1 max-sm:w-[calc(50%-0.25rem)]"
							)}
						>
							<Ban className="mr-2 h-4 w-4" />
							Annuler
						</DialogClose>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}