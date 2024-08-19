//
// Composant des actions disponibles pour une ligne d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useState } from "react";
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
import { useTranslations } from "next-intl";
import type { FileAttributes } from "@/interfaces/File";
import type { Table, Row, TableMeta } from "@tanstack/react-table";

import { Input } from "../../components/ui/input";
import RequestKey from "./request-key";
import FileHistory from "./file-history";
import ShareManager from "./share-manager";
import { renameFile } from "../actions/file-rename";
import { deleteFile } from "../actions/file-delete";
import { buttonVariants } from "../../components/ui/button";
import { changeFileStatus } from "../actions/file-status";
import { deleteSharedUser } from "../actions/shared-user-delete";
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
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals" );
	const dashboardMessages = useTranslations( "dashboard" );
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
				toast.success( formMessages( "infos.action_success" ), {
					description: formMessages( "infos.status_full_updated" )
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( formMessages( "infos.action_partial" ), {
					description: formMessages( "infos.status_partial_updated" )
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
				toast.success( formMessages( "infos.action_success" ), {
					description: formMessages( "infos.status_full_updated" )
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( formMessages( "infos.action_partial" ), {
					description: formMessages( "infos.status_partial_updated" )
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
			} );
		}
	};

	// Soumission de la requête de renommage d'un fichier.
	const submitFileRename = async ( name: string ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "name", name );

		selectedFiles.forEach( ( file ) =>
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
			selectedFiles
				.filter( ( file ) => files.includes( file.uuid ) )
				.forEach( ( file ) =>
				{
					file.name = name;
				} );

			states.setFiles( [ ...states.files ] );

			if ( files.length === selectedFiles.length )
			{
				// Envoi d'une notification de succès (mise à jour complète).
				toast.success( formMessages( "infos.action_success" ), {
					description: formMessages( "infos.name_full_updated" )
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( formMessages( "infos.action_partial" ), {
					description: formMessages( "infos.name_partial_updated" )
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
				toast.success( formMessages( "infos.action_success" ), {
					description: formMessages( "infos.file_full_deleted" )
				} );
			}
			else
			{
				// Envoi d'une notification d'avertissement (mise à jour partielle).
				toast.warning( formMessages( "infos.action_partial" ), {
					description: formMessages( "infos.file_partial_deleted" )
				} );
			}
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.all_sharing_updated" )
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
		<DropdownMenu open={isLoading ? false : undefined}>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger
				title={dashboardMessages( "title" )}
				className={merge(
					buttonVariants( { variant: "ghost" } ),
					"h-8 w-8 p-0"
				)}
				aria-label={dashboardMessages( "title" )}
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<MoreHorizontal className="h-4 w-4" />
				)}
			</DropdownMenuTrigger>

			{/* Actions disponibles */}
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					{dashboardMessages( "actions" )}
				</DropdownMenuLabel>

				{/* Rendre public */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							disabled={!isFileOwner}
							onSelect={( event ) => event.preventDefault()}
						>
							<Globe className="mr-2 h-4 w-4" />
							{modalMessages( "make_public.trigger" )}
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Globe className="mr-2 inline h-5 w-5 align-text-top" />

								{modalMessages( "make_public.title", {
									count: selectedCount
								} )}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{modalMessages.rich( "make_public.description", {
									b: ( children ) => (
										<strong>{children}</strong>
									)
								} )}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								{formMessages( "cancel" )}
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitMakePublic}>
								<Check className="mr-2 h-4 w-4" />
								{formMessages( "confirm" )}
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
							{modalMessages( "make_private.trigger" )}
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<FolderLock className="mr-2 inline h-5 w-5 align-text-top" />

								{modalMessages( "make_private.title", {
									count: selectedCount
								} )}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{modalMessages.rich(
									"make_private.description",
									{
										b: ( children ) => (
											<strong>{children}</strong>
										)
									}
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								{formMessages( "cancel" )}
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitMakePrivate}>
								<Check className="mr-2 h-4 w-4" />
								{formMessages( "confirm" )}
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
							{modalMessages( "reset_shares.trigger" )}
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<UserX className="mr-2 inline h-5 w-5 align-text-top" />

								{modalMessages( "reset_shares.title", {
									count: selectedCount
								} )}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{modalMessages.rich(
									"reset_shares.description",
									{
										b: ( children ) => (
											<strong>{children}</strong>
										)
									}
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								{formMessages( "cancel" )}
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitRemoveAllShares}>
								<Check className="mr-2 h-4 w-4" />
								{formMessages( "confirm" )}
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
							{modalMessages( "rename_file.trigger" )}
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<TextCursorInput className="mr-2 inline h-5 w-5 align-text-top" />

								{modalMessages( "rename_file.title", {
									count: selectedCount
								} )}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{modalMessages.rich( "rename_file.description", {
									b: ( children ) => (
										<strong>{children}</strong>
									)
								} )}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<form
							id="rename-file-form"
							onSubmit={( event ) =>
							{
								// Arrêt du comportement par défaut.
								event.preventDefault();

								// Récupération de la valeur du champ de saisie.
								const element = event.currentTarget
									.children[ 0 ] as HTMLInputElement;

								submitFileRename( element.value );
							}}
						>
							<Input
								name="name"
								maxLength={100}
								spellCheck="false"
								placeholder={dataFiles[ 0 ].name}
								autoComplete="off"
								defaultValue={dataFiles[ 0 ].name}
								autoCapitalize="off"
							/>
						</form>

						<AlertDialogFooter>
							<AlertDialogCancel
								type="reset"
								form="rename-file-form"
							>
								<Ban className="mr-2 h-4 w-4" />
								{formMessages( "cancel" )}
							</AlertDialogCancel>

							<AlertDialogAction
								type="submit"
								form="rename-file-form"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{formMessages( "loading" )}
									</>
								) : (
									<>
										<RefreshCw className="mr-2 h-4 w-4" />
										{formMessages( "update" )}
									</>
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Accès à la ressource */}
				{dataFiles[ 0 ].versions[ 0 ].encrypted ? (
					<RequestKey url={dataFiles[ 0 ].path}>
						<AlertDialogTrigger asChild>
							<DropdownMenuItem
								// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
								onSelect={( event ) => event.preventDefault()}
							>
								<ArrowUpRight className="mr-2 h-4 w-4" />
								{dashboardMessages( "reach_file" )}
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
							{dashboardMessages( "reach_file" )}
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
					{dashboardMessages( "copy_link" )}
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

							<strong>
								{modalMessages( "delete_file.trigger" )}
							</strong>
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent className="max-sm:max-w-[calc(100%-2rem)]">
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Trash className="mr-2 inline h-5 w-5 align-text-top" />

								{modalMessages( "delete_file.title", {
									count: selectedCount
								} )}
							</AlertDialogTitle>

							<AlertDialogDescription>
								{modalMessages.rich( "delete_file.description", {
									b: ( children ) => (
										<strong>{children}</strong>
									)
								} )}
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>
								<Ban className="mr-2 h-4 w-4" />
								{formMessages( "cancel" )}
							</AlertDialogCancel>

							<AlertDialogAction onClick={submitRemoveShare}>
								<Check className="mr-2 h-4 w-4" />
								{formMessages( "confirm" )}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}