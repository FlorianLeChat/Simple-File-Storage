//
// Composant des actions disponibles pour une ligne d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { merge } from "@/utilities/tailwind";
import serverAction from "@/utilities/recaptcha";
import { Ban,
	Check,
	Trash,
	UserX,
	Globe,
	Share2,
	Loader2,
	History,
	RefreshCw,
	FolderLock,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal,
	TextCursorInput } from "lucide-react";
import { FileAttributes } from "@/interfaces/File";
import type { Table, Row } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";

import { Input } from "../../components/ui/input";
import FileHistory from "./file-history";
import ShareManager from "./share-manager";
import { useToast } from "../../components/ui/use-toast";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
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
import { Button, buttonVariants } from "../../components/ui/button";
import { changeFileStatus, deleteFile, renameFile } from "../actions";

export default function RowActions( {
	table,
	row
}: {
	table: Table<FileAttributes>;
	row: Row<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const files = table.options.meta?.files ?? [];
	const rename = useRef<HTMLButtonElement>( null );
	const setFiles = useMemo(
		() => table.options.meta?.setFiles ?? ( () =>
		{} ),
		[ table.options.meta ]
	);
	const { toast } = useToast();
	const isLoading = table.options.meta?.loading.includes( row.id );
	const selectedRows = table.getFilteredSelectedRowModel();

	// Déclaration des variables d'état.
	const [ open, setOpen ] = useState( false );

	// Filtrage des données d'une ou plusieurs lignes.
	const rowData = files.filter( ( file ) => file.uuid === row.id );
	const selectedData =
		selectedRows.rows.length > 1
			? files.filter( ( file ) => selectedRows.rows.find( ( value ) => file.uuid === value.id ) )
			: rowData;

	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu
			open={open}
			onOpenChange={( state ) =>
			{
				if ( !isLoading )
				{
					// Ouverture du menu si l'état de chargement est
					//  inactif.
					setOpen( state );
				}
			}}
		>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger
				className={merge(
					buttonVariants( { variant: "ghost" } ),
					"h-8 w-8 p-0"
				)}
			>
				{isLoading ? (
					<>
						<span className="sr-only">Mise à jour en cours...</span>
						<Loader2 className="h-4 w-4 animate-spin" />
					</>
				) : (
					<>
						<span className="sr-only">Ouvrir le menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</>
				)}
			</DropdownMenuTrigger>

			{/* Actions disponibles */}
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions sur le fichier</DropdownMenuLabel>

				{/* Restriction d'accès */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<Globe className="mr-2 h-4 w-4" />
							Rendre public
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Globe className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir rendre public ce
									fichier ?
								</span>
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

							<AlertDialogAction
								onClick={async () =>
								{
									// Fermeture du menu des actions.
									setOpen( false );

									// Activation de l'état de chargement.
									table.options.meta?.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "uuid", file.uuid );
									} );
									form.append( "status", "public" );

									// Envoi de la requête au serveur et
									//  attente de la réponse.
									const state = ( await serverAction(
										changeFileStatus,
										form
									) ) as boolean;

									if ( state )
									{
										// Mise à jour de l'état des fichiers.
										selectedData.forEach( ( file ) =>
										{
											file.status = "public";
										} );

										setFiles( [ ...files ] );
									}

									// Fin de l'état de chargement.
									table.options.meta?.setLoading( [] );

									// Envoi d'une notification.
									toast( {
										title: "form.info.update_success",
										variant: state
											? "default"
											: "destructive",
										description: state
											? "form.info.status_updated"
											: "form.errors.server_error"
									} );
								}}
							>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<FolderLock className="mr-2 h-4 w-4" />
							Rendre privé
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<FolderLock className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir rendre privé ce
									fichier ?
								</span>
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

							<AlertDialogAction
								onClick={async () =>
								{
									// Fermeture du menu des actions.
									setOpen( false );

									// Activation de l'état de chargement.
									table.options.meta?.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "uuid", file.uuid );
									} );
									form.append( "status", "private" );

									// Envoi de la requête au serveur et
									//  attente de la réponse.
									const state = ( await serverAction(
										changeFileStatus,
										form
									) ) as boolean;

									if ( state )
									{
										// Mise à jour de l'état des fichiers.
										selectedData.forEach( ( file ) =>
										{
											file.status = "private";
										} );

										setFiles( [ ...files ] );
									}

									// Fin de l'état de chargement.
									table.options.meta?.setLoading( [] );

									// Envoi d'une notification.
									toast( {
										title: "form.info.update_success",
										variant: state
											? "default"
											: "destructive",
										description: state
											? "form.info.status_updated"
											: "form.errors.server_error"
									} );
								}}
							>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Gestion des partages */}
				<Dialog>
					<DialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<Share2 className="mr-2 h-4 w-4" />
							Gérer les partages
						</DropdownMenuItem>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Share2 className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Partage du fichier
								</span>
							</DialogTitle>

							<DialogDescription>
								Copier et partager le lien d&lsquo;accès aux
								utilisateurs de votre choix.
							</DialogDescription>
						</DialogHeader>

						<ShareManager />
					</DialogContent>
				</Dialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<UserX className="mr-2 h-4 w-4" />
							Supprimer tous les partages
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<UserX className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir supprimer tous les
									partages du fichier ?
								</span>
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

							<AlertDialogAction>
								<Check className="mr-2 h-4 w-4" />
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Accès, renommage et suppression */}
				<Dialog>
					<DialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<TextCursorInput className="mr-2 h-4 w-4" />
							Renommer la ressource
						</DropdownMenuItem>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<TextCursorInput className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Quel sera le nouveau nom de la ressource ?
								</span>
							</DialogTitle>

							<DialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Cela ne modifiera pas le lien d&lsquo;accès, ni
								son extension et ni les partages actuellement
								associés avec d&lsquo;autres utilisateurs.
							</DialogDescription>
						</DialogHeader>

						<Input
							type="text"
							onInput={( event ) =>
							{
								selectedData.forEach( ( file ) =>
								{
									file.name = event.currentTarget.value;
								} );
							}}
							onKeyDown={( event ) =>
							{
								if ( event.key === "Enter" )
								{
									rename.current?.click();
								}
							}}
							spellCheck="false"
							placeholder="john-doe"
							autoComplete="off"
							defaultValue={rowData[ 0 ].name}
							autoCapitalize="off"
						/>

						<DialogFooter>
							<Button
								ref={rename}
								onClick={async () =>
								{
									// Activation de l'état de chargement.
									table.options.meta?.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "uuid", file.uuid );
									} );
									form.append( "name", selectedData[ 0 ].name );

									// Envoi de la requête au serveur et
									//  attente de la réponse.
									const state = ( await serverAction(
										renameFile,
										form
									) ) as boolean;

									if ( state )
									{
										// Fermeture du menu des actions.
										setOpen( false );

										// Renommage des fichiers.
										setFiles( [ ...files ] );
									}

									// Fin de l'état de chargement.
									table.options.meta?.setLoading( [] );

									// Envoi d'une notification.
									toast( {
										title: "form.info.update_success",
										variant: state
											? "default"
											: "destructive",
										description: state
											? "form.info.name_updated"
											: "form.errors.server_error"
									} );
								}}
								disabled={isLoading}
								className="max-sm:w-full"
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
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<a
					rel="noopener noreferrer"
					href={rowData[ 0 ].path}
					target="_blank"
				>
					<DropdownMenuItem>
						<ArrowUpRight className="mr-2 h-4 w-4" />
						Accéder à la ressource
					</DropdownMenuItem>
				</a>

				<DropdownMenuSeparator />

				<Dialog>
					<DialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<History className="mr-2 h-4 w-4" />
							Voir les révisions
						</DropdownMenuItem>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<History className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Révisions disponibles
								</span>
							</DialogTitle>

							<DialogDescription>
								Accéder et restaurer une version antérieure du
								fichier.
							</DialogDescription>
						</DialogHeader>

						<FileHistory />
					</DialogContent>
				</Dialog>

				<DropdownMenuItem
					onClick={() => navigator.clipboard.writeText(
						new URL( rowData[ 0 ].path, window.location.href ).href
					)}
				>
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier le lien d&lsquo;accès
				</DropdownMenuItem>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
							className="text-destructive"
						>
							<Trash className="mr-2 h-4 w-4" />

							<strong>Supprimer définitivement</strong>
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Trash className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir supprimer ce
									fichier ?
								</span>
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

							<AlertDialogAction
								onClick={async () =>
								{
									// Fermeture du menu des actions.
									setOpen( false );

									// Activation de l'état de chargement.
									table.options.meta?.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "uuid", file.uuid );
									} );

									// Envoi de la requête au serveur et
									//  attente de la réponse.
									const state = ( await serverAction(
										deleteFile,
										form
									) ) as boolean;

									if ( state )
									{
										// Suppression des fichiers de la liste.
										setFiles(
											files.filter(
												( file ) => !selectedData.find(
													( value ) => value.uuid
															=== file.uuid
												)
											)
										);
									}

									// Fin de l'état de chargement.
									table.options.meta?.setLoading( [] );

									// Envoi d'une notification.
									toast( {
										title: "form.info.action_success",
										variant: state
											? "default"
											: "destructive",
										description: state
											? "form.info.file_deleted"
											: "form.errors.server_error"
									} );
								}}
							>
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