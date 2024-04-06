//
// Composant de restauration des versions précédentes d'un fichier.
//

"use client";

import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useState } from "react";
import serverAction from "@/utilities/recaptcha";
import { formatSize } from "@/utilities/react-table";
import type { TableMeta } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { FileAttributes } from "@/interfaces/File";
import { Ban, Check, History, ArrowUpRight } from "lucide-react";

import RequestKey from "./request-key";
import { Separator } from "../../components/ui/separator";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { buttonVariants } from "../../components/ui/button";
import { restoreVersion } from "../actions/restore-version";
import { DropdownMenuItem } from "../../components/ui/dropdown-menu";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogDescription } from "../../components/ui/alert-dialog";

export default function FileHistory( {
	file,
	states,
	disabled
}: {
	file: FileAttributes;
	states: TableMeta<FileAttributes>;
	disabled: boolean;
} )
{
	// Déclaration des variables d'état.
	const formMessages = useTranslations( "form" );
	const historyMessages = useTranslations( "modals.file_history" );
	const restoreMessages = useTranslations( "modals.restore_version" );
	const [ isOpen, setOpen ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ identifier, setIdentifier ] = useState( "" );

	// Déclaration des constantes.
	const count = file.versions.length ?? 0;

	// Soumission de la restauration de la version.
	const submitRestoration = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "versionId", identifier );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const data = await serverAction( restoreVersion, form );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( data )
		{
			// Sélection de la version sélectionnée
			//  pour être restaurée.
			const selectedVersion = file.versions.find(
				( value ) => value.uuid === identifier
			);

			if ( !selectedVersion )
			{
				return;
			}

			// Copie et modification de l'identifiant
			//  de la version sélectionnée.
			const newVersion = {
				...selectedVersion
			};

			newVersion.uuid = data as string;

			// Ajout de la nouvelle version à la liste
			//  des versions du fichier.
			file.versions.unshift( newVersion );

			// Mise à jour de la liste des fichiers.
			states.setFiles( states.files );

			// Envoi d'une notification de succès.
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.version_restored" )
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
			} );
		}
	};

	// Affichage du rendu HTML du composant.
	return (
		<Dialog
			open={isOpen}
			onOpenChange={( state ) =>
			{
				if ( !isLoading )
				{
					setOpen( state );
				}
			}}
		>
			<DialogTrigger asChild>
				{/* Bouton de sélection */}
				<DropdownMenuItem
					// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
					disabled={disabled}
					onSelect={( event ) => event.preventDefault()}
				>
					<History className="mr-2 h-4 w-4" />
					{historyMessages( "trigger" )}
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[75%]">
				{/* En-tête de la fenêtre modale */}
				<DialogHeader>
					<DialogTitle>
						<History className="mr-2 inline h-5 w-5 align-text-top" />
						{historyMessages( "title" )}
					</DialogTitle>

					<DialogDescription>
						{historyMessages( "description" )}
					</DialogDescription>
				</DialogHeader>

				{/* Liste des révisions */}
				<ul className="rounded-md border p-4">
					{file.versions.map( ( version, index ) =>
					{
						// Calcul de la différence de taille entre la version
						//  actuelle et la version précédente.
						const size =
							version.size
							- file.versions[ Math.min( index + 1, count - 1 ) ].size;

						// Définition de la couleur en fonction de la différence de
						//  taille (vert si négatif, rouge si positif, gris si nul).
						const color =
							size === 0
								? "text-gray-600"
								: ( size < 0 && "text-green-600" )
									|| "text-destructive";

						// Mise en forme de la différence de taille.
						const offset =
							size < 0
								? `-${ formatSize( size ) }`
								: `+${ formatSize( size ) }`;

						return (
							<li key={version.uuid} className="text-sm">
								{/* Nom de la révision */}
								<h3>
									{historyMessages( "details", {
										date: new Intl.DateTimeFormat(
											undefined,
											{
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric"
											}
										).format( version.date )
									} )}
								</h3>

								{/* Taille et différence de la révision */}
								<p
									className="inline-block text-muted-foreground"
									suppressHydrationWarning
								>
									{formatSize( version.size )}
								</p>

								<p
									className={`ml-2 inline-block font-extrabold ${ color }`}
								>
									{index === file.versions.length - 1
										? ""
										: offset}
								</p>

								{/* Saut de ligne */}
								<br />

								{/* Accès au fichier */}
								{version.encrypted ? (
									<RequestKey url={version.path}>
										<AlertDialogTrigger
											className={merge(
												buttonVariants(),
												"mr-2 mt-2"
											)}
										>
											<ArrowUpRight className="mr-2 h-4 w-4" />
											{historyMessages( "reach" )}
										</AlertDialogTrigger>
									</RequestKey>
								) : (
									<a
										rel="noreferrer noopener"
										href={version.path}
										target="_blank"
										className={merge(
											buttonVariants(),
											"mr-2 mt-2"
										)}
									>
										<ArrowUpRight className="mr-2 h-4 w-4" />
										{historyMessages( "reach" )}
									</a>
								)}

								{/* Restauration de la version */}
								<AlertDialog>
									<AlertDialogTrigger
										onClick={() => setIdentifier( version.uuid )}
										disabled={index === 0 || isLoading}
										className={merge(
											buttonVariants( {
												variant: "secondary"
											} ),
											"mt-2"
										)}
									>
										<History className="mr-2 h-4 w-4" />
										{restoreMessages( "trigger" )}
									</AlertDialogTrigger>

									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												<History className="mr-2 inline h-5 w-5 align-text-top" />
												{restoreMessages( "title" )}
											</AlertDialogTitle>

											<AlertDialogDescription>
												{restoreMessages( "description" )}
											</AlertDialogDescription>
										</AlertDialogHeader>

										<AlertDialogFooter>
											<AlertDialogCancel
												disabled={isLoading}
											>
												<Ban className="mr-2 h-4 w-4" />
												{formMessages( "cancel" )}
											</AlertDialogCancel>

											<AlertDialogAction
												onClick={submitRestoration}
												disabled={isLoading}
											>
												<Check className="mr-2 h-4 w-4" />
												{formMessages( "confirm" )}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>

								{/* Séparateur horizontal */}
								{index !== file.versions.length - 1 && (
									<Separator className="my-4" />
								)}
							</li>
						);
					} )}
				</ul>
			</DialogContent>
		</Dialog>
	);
}