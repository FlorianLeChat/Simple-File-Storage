//
// Composant de téléversement des fichiers.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { formatSize } from "@/utilities/react-table";
import { useFormState } from "react-dom";
import { useState,
	useEffect,
	type Dispatch,
	type SetStateAction } from "react";
import { Ban, Loader2, PlusCircleIcon, UploadCloud } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { useToast } from "../../components/ui/use-toast";
import { type File } from "./columns";
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
	files,
	setFiles
}: {
	files: File[];
	setFiles: Dispatch<SetStateAction<File[]>>;
} )
{
	// Déclaration des constantes.
	const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA ?? 0 );
	const { toast } = useToast();
	const formState = {
		success: true,
		reason: "",
		data: []
	};

	// Déclaration des variables d'état.
	const [ quota ] = useState(
		files.reduce( ( previous, current ) => previous + current.size, 0 )
	);
	const [ loading, setLoading ] = useState( false );
	const [ uploadState, uploadAction ] = useFormState( uploadFiles, formState );

	// Déclaration du formulaire.
	const percent = ( ( quota / maxQuota ) * 100 ).toFixed( 2 ) as unknown as number;
	const form = useForm( {
		defaultValues: {
			upload: ""
		}
	} );

	// Affichage des erreurs en provenance du serveur.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !uploadState )
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
		const { success, reason } = uploadState;

		// On informe ensuite que le traitement est terminé.
		setLoading( false );

		// On réinitialise après une partie du formulaire
		//  en cas de succès.
		if ( success )
		{
			form.reset();
		}

		// On affiche enfin le message correspondant si une raison
		//  a été fournie.
		if ( reason !== "" )
		{
			toast( {
				title: success
					? "form.info.upload_success"
					: "form.errors.upload_failed",
				variant: success ? "default" : "destructive",
				description: reason
			} );
		}
	}, [ files, setFiles, toast, form, uploadState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Dialog>
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
							La taille maximale du téléversement ne doit pas
							dépasser votre quota individuel.
						</strong>
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						action={( formData ) => serverAction( uploadAction, formData )}
						onSubmit={() => setLoading( true )}
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
											className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
										/>
									</FormControl>

									<FormDescription className="!mt-3">
										<Progress
											value={percent}
											className="mb-1 h-1"
										/>

										<span className="text-sm text-muted-foreground">
											{Number( percent ).toLocaleString()}%
											du quota actuellement utilisés (
											{formatSize( quota )} /{" "}
											{formatSize( maxQuota )})
										</span>
									</FormDescription>

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