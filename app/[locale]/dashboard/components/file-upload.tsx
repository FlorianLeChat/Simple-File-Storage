//
// Composant de téléversement des fichiers.
//
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircleIcon, UploadCloud } from "lucide-react";

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
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { Button, buttonVariants } from "../../components/ui/button";

// Déclaration du schéma de validation du formulaire.
const fileSchema = z.object( {
	upload: z.any()
} );

export default function FileUpload()
{
	// Déclaration des constantes.
	const { toast } = useToast();

	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Téléversement des fichiers sélectionnés.
	const uploadFile = ( data: z.infer<typeof fileSchema> ) =>
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

	// Définition des formulaires.
	const uploadForm = useForm<z.infer<typeof fileSchema>>( {
		resolver: zodResolver( fileSchema )
	} );

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

				<Form {...uploadForm}>
					<form
						onSubmit={uploadForm.handleSubmit( uploadFile )}
						className="space-y-6"
					>
						<FormField
							name="upload"
							control={uploadForm.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel className="sr-only">
										Fichiers à téléverser
									</FormLabel>

									<FormControl>
										<Input
											{...field}
											type="file"
											accept="image/*,video/*,audio/*"
											multiple
											required
											disabled={isLoading}
											className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
										/>
									</FormControl>

									<FormDescription className="!mt-3">
										<Progress
											value={33}
											className="mb-1 h-1"
										/>

										<span className="text-sm text-muted-foreground">
											33% du quota actuellement utilisés
											(333 Mo / 1 Go)
										</span>
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bouton de validation du formulaire */}
						<Button disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Mise à jour...
								</>
							) : (
								<>
									<PlusCircleIcon className="mr-2 h-4 w-4" />
									Ajouter
								</>
							)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}