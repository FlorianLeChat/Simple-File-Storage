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
	Share2,
	Loader2,
	History,
	RefreshCw,
	FolderLock,
	ShieldCheck,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal,
	TextCursorInput } from "lucide-react";
import { FileAttributes } from "@/interfaces/File";
import { useRef, useState } from "react";
import type { Table, Row, TableMeta } from "@tanstack/react-table";

import { Input } from "../../components/ui/input";
import FileHistory from "./file-history";
import ShareManager from "./share-manager";
import { deleteFile,
	renameFile,
	deleteSharedUser,
	changeFileStatus } from "../actions";
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

export default function RowActions( {
	table,
	row
}: {
	table: Table<FileAttributes>;
	row: Row<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const model = table.getFilteredSelectedRowModel();
	const count = Math.max( model.rows.length, 1 );
	const states = table.options.meta as TableMeta<FileAttributes>;

	// Déclaration des variables d'état.
	const rename = useRef<HTMLButtonElement>( null );
	const access = useRef<HTMLButtonElement>( null );
	const loading = states.loading.includes( row.id );
	const [ open, setOpen ] = useState( false );
	const [ password, setPassword ] = useState( "" );

	// Filtrage des données d'une ou plusieurs lignes.
	const rowData = states.files.filter( ( file ) => file.uuid === row.id );
	const selectedData =
		model.rows.length > 1
			? states.files.filter( ( file ) => model.rows.find( ( value ) => file.uuid === value.id ) )
			: rowData;

	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu
			open={open}
			onOpenChange={( state ) =>
			{
				if ( !loading )
				{
					// Blocage de l'ouverture du menu si l'état de chargement
					//  est inactif.
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
				{loading ? (
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
									Êtes-vous sûr de vouloir rendre public{" "}
									{count} fichier(s) ?
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
									// Activation de l'état de chargement.
									states.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "fileId", file.uuid );
									} );
									form.append( "status", "public" );

									// Envoi de la requête au serveur et
									//  traitement de la réponse.
									const files = ( await serverAction(
										changeFileStatus,
										form
									) ) as string[];
									const processed = selectedData.filter(
										( file ) => files.includes( file.uuid )
									);

									if ( processed.length > 0 )
									{
										// Mise à jour de l'état des fichiers.
										processed.forEach( ( file ) =>
										{
											file.status = "public";
										} );

										states.setFiles( [ ...states.files ] );
									}

									// Fin de l'état de chargement.
									states.setLoading( [] );

									// Envoi d'une notification.
									if ( files.length === processed.length )
									{
										toast.success(
											"form.info.update_success",
											{
												description:
													"form.info.status_updated"
											}
										);
									}
									else if ( processed.length > 0 )
									{
										toast.warning(
											"form.info.update_partial",
											{
												description:
													"form.info.status_updated"
											}
										);
									}
									else
									{
										toast.error(
											"form.errors.update_failed",
											{
												description:
													"form.errors.server_error"
											}
										);
									}
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
							disabled={rowData[ 0 ].status === "shared"}
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
									Êtes-vous sûr de vouloir rendre privé{" "}
									{count} fichier(s) ?
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
									// Activation de l'état de chargement.
									states.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "fileId", file.uuid );
									} );
									form.append( "status", "private" );

									// Envoi de la requête au serveur et
									//  traitement de la réponse.
									const files = ( await serverAction(
										changeFileStatus,
										form
									) ) as string[];
									const processed = selectedData.filter(
										( file ) => files.includes( file.uuid )
									);

									if ( processed.length > 0 )
									{
										// Mise à jour de l'état des fichiers.
										processed.forEach( ( file ) =>
										{
											file.status = "private";
										} );

										states.setFiles( [ ...states.files ] );
									}

									// Fin de l'état de chargement.
									states.setLoading( [] );

									// Envoi d'une notification.
									if ( files.length === processed.length )
									{
										toast.success(
											"form.info.update_success",
											{
												description:
													"form.info.status_updated"
											}
										);
									}
									else if ( processed.length > 0 )
									{
										toast.warning(
											"form.info.update_partial",
											{
												description:
													"form.info.status_updated"
											}
										);
									}
									else
									{
										toast.error(
											"form.errors.update_failed",
											{
												description:
													"form.errors.server_error"
											}
										);
									}
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

					<DialogContent className="overflow-auto max-sm:max-h-full sm:max-h-[50%]">
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

						<ShareManager table={table} row={row} />
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
									partages de {count} fichier(s) ?
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

							<AlertDialogAction
								onClick={async () =>
								{
									// Activation de l'état de chargement.
									states.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "fileId", file.uuid );
									} );

									// Envoi de la requête au serveur et
									//  traitement de la réponse.
									const state = ( await serverAction(
										deleteSharedUser,
										form
									) ) as boolean;

									if ( state )
									{
										selectedData.forEach( ( file ) =>
										{
											file.status = "private";
											file.shares = [];
										} );

										states.setFiles( [ ...states.files ] );
									}

									// Fin de l'état de chargement.
									states.setLoading( [] );

									// Envoi d'une notification.
									if ( state )
									{
										toast.success(
											"form.info.action_success",
											{
												description:
													"form.info.sharing_updated"
											}
										);
									}
									else
									{
										toast.error(
											"form.errors.file_deleted",
											{
												description:
													"form.errors.server_error"
											}
										);
									}
								}}
							>
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
									Quel sera le nouveau nom de {count}{" "}
									ressource(s) ?
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
								// Mise à jour de l'entrée utilisateur.
								selectedData.forEach( ( file ) =>
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
							defaultValue={rowData[ 0 ].name}
							autoCapitalize="off"
						/>

						<DialogFooter>
							<Button
								ref={rename}
								onClick={async () =>
								{
									// Activation de l'état de chargement.
									states.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "fileId", file.uuid );
									} );
									form.append( "name", selectedData[ 0 ].name );

									// Envoi de la requête au serveur et
									//  traitement de la réponse.
									const files = ( await serverAction(
										renameFile,
										form
									) ) as string[];
									const processed = selectedData.filter(
										( file ) => files.includes( file.uuid )
									);

									if ( processed.length > 0 )
									{
										// Renommage des fichiers traités par le serveur.
										states.setFiles(
											states.files.filter(
												( file ) => !processed.find(
													( value ) => value.uuid
															=== file.uuid
												)
											)
										);
									}

									// Fin de l'état de chargement.
									states.setLoading( [] );

									// Envoi d'une notification.
									if ( files.length === processed.length )
									{
										toast.success(
											"form.info.update_success",
											{
												description:
													"form.info.name_updated"
											}
										);
									}
									else if ( processed.length > 0 )
									{
										toast.warning(
											"form.info.update_partial",
											{
												description:
													"form.info.name_updated"
											}
										);
									}
									else
									{
										toast.error(
											"form.errors.update_failed",
											{
												description:
													"form.errors.server_error"
											}
										);
									}
								}}
								disabled={loading || !selectedData[ 0 ].name}
								className="max-sm:w-full"
							>
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
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{rowData[ 0 ].encrypted ? (
					<Dialog>
						<DialogTrigger asChild>
							<DropdownMenuItem
								// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
								onSelect={( event ) => event.preventDefault()}
							>
								<ArrowUpRight className="mr-2 h-4 w-4" />
								Accéder à la ressource
							</DropdownMenuItem>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									<ShieldCheck className="mr-2 inline h-5 w-5" />

									<span className="align-middle">
										Veuillez saisir la clé de déchiffrement.
									</span>
								</DialogTitle>

								<DialogDescription>
									Ce fichier est chiffré par une clé que le
									serveur ne possède pas. Pour accéder à la
									ressource, veuillez saisir la clé de
									déchiffrement qui vous a été fournie lors du
									téléversement du fichier.{" "}
									<strong>
										En cas de perte, vous ne pourrez plus
										accéder à la ressource. Si c&lsquo;est
										le cas, supprimez le fichier et
										téléversez-le à nouveau.
										L&lsquo;assistance technique ne pourra
										pas vous aider car elle ne possède pas
										la clé de déchiffrement.
									</strong>
								</DialogDescription>
							</DialogHeader>

							<Input
								type="text"
								onInput={( event ) =>
								{
									// Mise à jour de l'entrée utilisateur.
									setPassword( event.currentTarget.value );
								}}
								onKeyDown={( event ) =>
								{
									// Soumission du formulaire par clavier.
									const { key } = event;

									if (
										key === "Enter"
										|| key === "NumpadEnter"
									)
									{
										access.current?.click();
									}
								}}
								spellCheck="false"
								placeholder="your_key"
								autoComplete="off"
								autoCapitalize="off"
							/>

							<DialogFooter>
								<Button
									ref={access}
									onClick={() =>
									{
										// Ouverture de la ressource dans un nouvel onglet.
										window.open(
											new URL(
												`${ rowData[ 0 ].path }?key=${ password }`,
												window.location.href
											).href,
											"_blank",
											"noopener,noreferrer"
										);
									}}
									disabled={loading || !password}
									className="max-sm:w-full"
								>
									<ArrowUpRight className="mr-2 h-4 w-4" />
									Accéder
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				) : (
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
				)}

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

						<FileHistory table={table} row={row} />
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
									Êtes-vous sûr de vouloir supprimer {count}{" "}
									fichier(s) ?
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
									// Activation de l'état de chargement.
									states.setLoading(
										selectedData.map( ( value ) => value.uuid )
									);

									// Création d'un formulaire de données.
									const form = new FormData();
									selectedData.forEach( ( file ) =>
									{
										form.append( "fileId", file.uuid );
									} );

									// Envoi de la requête au serveur et
									//  traitement de la réponse.
									const files = ( await serverAction(
										deleteFile,
										form
									) ) as string[];
									const processed = selectedData.filter(
										( file ) => files.includes( file.uuid )
									);

									if ( processed.length > 0 )
									{
										// Suppression des fichiers traités
										//  par le serveur dans la liste.
										const newFiles = states.files.filter(
											( file ) => !processed.find(
												( value ) => value.uuid
														=== file.uuid
											)
										);

										states.setFiles( newFiles );

										// Mise à jour du quota utilisateur.
										states.setQuota(
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

									// Fin de l'état de chargement.
									states.setLoading( [] );

									// Envoi d'une notification.
									if ( files.length === processed.length )
									{
										toast.success(
											"form.info.action_success",
											{
												description:
													"form.info.name_updated"
											}
										);
									}
									else if ( processed.length > 0 )
									{
										toast.warning(
											"form.info.action_partial",
											{
												description:
													"form.info.name_updated"
											}
										);
									}
									else
									{
										toast.error(
											"form.errors.file_deleted",
											{
												description:
													"form.errors.server_error"
											}
										);
									}
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