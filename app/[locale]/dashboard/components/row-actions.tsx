//
// Composant des actions disponibles pour une ligne d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import serverAction from "@/utilities/recaptcha";
import { Ban,
	Check,
	Trash,
	UserX,
	Globe,
	Loader2,
	RefreshCw,
	FolderLock,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal,
	TextCursorInput } from "lucide-react";
import { useSession } from "next-auth/react";
import { FileAttributes } from "@/interfaces/File";
import { useRef, useState } from "react";
import type { Table, Row, TableMeta } from "@tanstack/react-table";

import { Input } from "../../components/ui/input";
import RequestKey from "./request-key";
import FileHistory from "./file-history";
import ShareManager from "./share-manager";
import { deleteFile,
	renameFile,
	deleteSharedUser,
	changeFileStatus } from "../actions";
import { buttonVariants } from "../../components/ui/button";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogDescription } from "../../components/ui/alert-dialog";

export default function RowActions( {
	table,
	row
}: {
	table: Table<FileAttributes>;
	row: Row<FileAttributes>;
} )
{
	// Déclaration des variables d'état.
	const rename = useRef<HTMLButtonElement>( null );
	const [ isLoading, setLoading ] = useState( false );

	// Déclaration des constantes.
	const states = table.options.meta as TableMeta<FileAttributes>;
	const session = useSession();
	const dataFiles = states.files.filter( ( file ) => file.uuid === row.id );
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = Math.max( selectedRows.length, 1 );
	const selectedFiles =
		selectedRows.length > 1
			? states.files.filter( ( file ) => selectedRows.find( ( value ) => file.uuid === value.id ) )
			: dataFiles;
	const fileShares = selectedFiles[ 0 ].shares.find(
		( share ) => share.user.uuid === session.data?.user.id
	);
	const isFileOwner = fileShares ? fileShares.status === "write" : true;

	// Soumission de la requête de publication d'un fichier.
	const submitMakePublic = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "status", "public" );

		selectedFiles.forEach( ( file ) =>
		{
			form.append( "fileId", file.uuid );
		} );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const files = ( await serverAction( changeFileStatus, form ) ) as string[];

		// Fin de l'état de chargement.
		setLoading( false );

		if ( files.length > 0 )
		{
			// Filtrage des fichiers partagés.
			const processed = selectedFiles.filter( ( file ) => files.includes( file.uuid ) );
			const sharedFiles = processed.filter(
				( file ) => file.owner.id !== session.data?.user.id
			);

			// Mise à jour de l'état des fichiers.
			processed.forEach( ( file ) =>
			{
				file.status = "public";
			} );

			states.setFiles(
				states.files.filter(
					( file ) => !sharedFiles.find( ( value ) => value.uuid === file.uuid )
				)
			);

			if ( files.length === selectedFiles.length )
			{
				// Envoi d'une notification de succès (mise à jour complète).
				toast.success( "form.info.action_success", {
					description: "form.info.status_updated"
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( "form.info.action_partial", {
					description: "form.info.status_updated"
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de privatisation d'un fichier.
	const submitMakePrivate = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "status", "private" );

		selectedFiles.forEach( ( file ) =>
		{
			form.append( "fileId", file.uuid );
		} );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const files = ( await serverAction( changeFileStatus, form ) ) as string[];

		// Fin de l'état de chargement.
		setLoading( false );

		if ( files.length > 0 )
		{
			// Mise à jour de l'état des fichiers.
			selectedFiles
				.filter( ( file ) => files.includes( file.uuid ) )
				.forEach( ( file ) =>
				{
					file.status = "private";
				} );

			states.setFiles( [ ...states.files ] );

			if ( files.length === selectedFiles.length )
			{
				// Envoi d'une notification de succès (mise à jour complète).
				toast.success( "form.info.action_success", {
					description: "form.info.status_updated"
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( "form.info.action_partial", {
					description: "form.info.status_updated"
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de renommage d'un fichier.
	const submitFileRename = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "name", dataFiles[ 0 ].name );

		dataFiles.forEach( ( file ) =>
		{
			form.append( "fileId", file.uuid );
		} );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const files = ( await serverAction( renameFile, form ) ) as string[];

		// Fin de l'état de chargement.
		setLoading( false );

		if ( files.length > 0 )
		{
			// Renommage des fichiers traités par le serveur.
			states.setFiles( [ ...states.files ] );

			if ( files.length === selectedFiles.length )
			{
				// Envoi d'une notification de succès (mise à jour complète).
				toast.success( "form.info.action_success", {
					description: "form.info.name_updated"
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( "form.info.action_partial", {
					description: "form.info.name_updated"
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de suppression d'un partage.
	const submitRemoveShare = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		selectedFiles.forEach( ( file ) =>
		{
			form.append( "fileId", file.uuid );
		} );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const files = ( await serverAction( deleteFile, form ) ) as string[];

		// Fin de l'état de chargement.
		setLoading( false );

		if ( files.length > 0 )
		{
			// Suppression des fichiers traités
			//  par le serveur dans la liste.
			const newFiles = states.files.filter(
				( file ) => !files.find( ( value ) => value === file.uuid )
			);

			states.setFiles( newFiles );

			if ( files.length === selectedFiles.length )
			{
				// Envoi d'une notification de succès (mise à jour complète).
				toast.success( "form.info.action_success", {
					description: "form.info.file_deleted"
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( "form.info.action_partial", {
					description: "form.info.file_deleted"
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de suppression de tous les partages.
	const submitRemoveAllShares = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		selectedFiles.forEach( ( file ) =>
		{
			form.append( "fileId", file.uuid );
		} );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const state = await serverAction( deleteSharedUser, form );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state )
		{
			// Filtrage des fichiers partagés.
			const sharedFiles = selectedFiles.filter(
				( value ) => value.owner.id !== session.data?.user.id
			);

			// Mise à jour de l'état des fichiers.
			selectedFiles.forEach( ( file ) =>
			{
				file.status = "private";
				file.shares = [];
			} );

			states.setFiles(
				states.files.filter(
					( file ) => !sharedFiles.find( ( value ) => value.uuid === file.uuid )
				)
			);

			// Envoi d'une notification de succès.
			toast.success( "form.info.action_success", {
				description: "form.info.sharing_updated"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu open={isLoading ? false : undefined}>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger
				title="Ouvrir le menu des actions"
				className={merge(
					buttonVariants( { variant: "ghost" } ),
					"h-8 w-8 p-0"
				)}
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<MoreHorizontal className="h-4 w-4" />
				)}
			</DropdownMenuTrigger>

			{/* Actions disponibles */}
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions sur le fichier</DropdownMenuLabel>

				{/* Rendre public */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={!isFileOwner}
							onSelect={( event ) => event.preventDefault()}
						>
							<Globe className="mr-2 h-4 w-4" />
							Rendre public
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Globe className="mr-2 inline h-5 w-5 align-text-top" />
								Êtes-vous sûr de vouloir rendre public{" "}
								{selectedCount} fichier(s) ?
							</AlertDialogTitle>

							<AlertDialogDescription>
								En rendant ce fichier public, il sera accessible
								à tout le monde, même aux utilisateurs en dehors
								du site Internet.{" "}
								<strong>
									Les restrictions de partage seront
									réinitialisées et désactivées.
								</strong>
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								Annuler
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitMakePublic}>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Rendre privé */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={dataFiles[ 0 ].status === "shared"}
							onSelect={( event ) => event.preventDefault()}
						>
							<FolderLock className="mr-2 h-4 w-4" />
							Rendre privé
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<FolderLock className="mr-2 inline h-5 w-5 align-text-top" />
								Êtes-vous sûr de vouloir rendre privé{" "}
								{selectedCount} fichier(s) ?
							</AlertDialogTitle>

							<AlertDialogDescription>
								En rendant ce fichier privé, il ne sera plus
								accessible aux utilisateurs en dehors du site
								Internet, ni aux utilisateurs non autorisés via
								les options de partage.{" "}
								<strong>
									Le fichier peut encore être accessible si
									celui-ci a été mis en cache par un tiers.
								</strong>
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								Annuler
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitMakePrivate}>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Gestion des partages */}
				<ShareManager
					file={dataFiles[ 0 ]}
					states={states}
					disabled={!isFileOwner}
				/>

				{/* Suppression des partages */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={!isFileOwner}
							onSelect={( event ) => event.preventDefault()}
						>
							<UserX className="mr-2 h-4 w-4" />
							Supprimer tous les partages
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<UserX className="mr-2 inline h-5 w-5 align-text-top" />
								Êtes-vous sûr de vouloir supprimer tous les
								partages de {selectedCount} fichier(s) ?
							</AlertDialogTitle>

							<AlertDialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Elle supprimera tous les partages du fichier et
								rendra le fichier privé.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								Annuler
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitRemoveAllShares}>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Renommage de la ressource */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={!isFileOwner}
							onSelect={( event ) => event.preventDefault()}
						>
							<TextCursorInput className="mr-2 h-4 w-4" />
							Renommer la ressource
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<TextCursorInput className="mr-2 inline h-5 w-5 align-text-top" />
								Quel sera le nouveau nom de {selectedCount}{" "}
								ressource(s) ?
							</AlertDialogTitle>

							<AlertDialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Cela ne modifiera pas le lien d&lsquo;accès, ni
								son extension et ni les partages actuellement
								associés avec d&lsquo;autres utilisateurs.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<Input
							onInput={( event ) =>
							{
								// Mise à jour de l'entrée utilisateur.
								selectedFiles.forEach( ( file ) =>
								{
									file.name = event.currentTarget.value;
								} );
							}}
							onKeyDown={( event ) =>
							{
								// Soumission du formulaire par clavier.
								const { key } = event;

								if ( key === "Enter" || key === "NumpadEnter" )
								{
									rename.current?.click();
								}
							}}
							spellCheck="false"
							placeholder="john-doe"
							autoComplete="off"
							defaultValue={dataFiles[ 0 ].name}
							autoCapitalize="off"
						/>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								Annuler
							</AlertDialogCancel>

							<AlertDialogAction
								ref={rename}
								onClick={submitFileRename}
								disabled={isLoading || !dataFiles[ 0 ].name}
							>
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
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Accès à la ressource */}
				{dataFiles[ 0 ].versions[ 0 ].encrypted ? (
					<RequestKey url={`${ dataFiles[ 0 ].path }?key=`}>
						<AlertDialogTrigger asChild>
							<DropdownMenuItem
								// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
								onSelect={( event ) => event.preventDefault()}
							>
								<ArrowUpRight className="mr-2 h-4 w-4" />
								Accéder à la ressource
							</DropdownMenuItem>
						</AlertDialogTrigger>
					</RequestKey>
				) : (
					<a
						rel="noopener noreferrer"
						href={dataFiles[ 0 ].path}
						target="_blank"
					>
						<DropdownMenuItem>
							<ArrowUpRight className="mr-2 h-4 w-4" />
							Accéder à la ressource
						</DropdownMenuItem>
					</a>
				)}

				<DropdownMenuSeparator />

				{/* Accès aux révisions */}
				<FileHistory
					file={dataFiles[ 0 ]}
					states={states}
					disabled={
						!isFileOwner || !session.data?.user.preferences.versions
					}
				/>

				{/* Copie du lien d'accès */}
				<DropdownMenuItem
					onClick={() => navigator.clipboard.writeText(
						new URL( dataFiles[ 0 ].path, window.location.href )
							.href
					)}
				>
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier le lien d&lsquo;accès
				</DropdownMenuItem>

				{/* Suppression de la ressource */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={!isFileOwner}
							onSelect={( event ) => event.preventDefault()}
							className="text-destructive"
						>
							<Trash className="mr-2 h-4 w-4" />

							<strong>Supprimer définitivement</strong>
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Trash className="mr-2 inline h-5 w-5 align-text-top" />
								Êtes-vous sûr de vouloir supprimer{" "}
								{selectedCount} fichier(s) ?
							</AlertDialogTitle>

							<AlertDialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Elle supprimera définitivement le fichier de
								votre espace de stockage.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								Annuler
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitRemoveShare}>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}