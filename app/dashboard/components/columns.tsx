//
// Composant des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { merge } from "@/utilities/tailwind";
import { ColumnDef } from "@tanstack/react-table";
import { Trash,
	UserX,
	Globe,
	Share2,
	History,
	FolderLock,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import FileHistory from "./file-history";
import { Checkbox } from "../../components/ui/checkbox";
import ColumnHeader from "./column-header";
import ShareManager from "./share-manager";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { buttonVariants } from "../../components/ui/button";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogDescription } from "../../components/ui/alert-dialog";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator } from "../../components/ui/dropdown-menu";

// Déclaration du typage d'un fichier.
export type File = {
	id: string;
	name: string;
	type: string;
	size: number;
	date: string;
	status: "public" | "private" | "shared";
};

// Déclaration des colonnes du tableau.
export const columns: ColumnDef<File>[] = [
	{
		// Case de sélection d'une ou plusieurs lignes.
		id: "select",
		header: ( { table } ) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				aria-label="Tout sélectionner"
				onCheckedChange={( value ) => table.toggleAllPageRowsSelected( !!value )}
			/>
		),
		cell: ( { row } ) => (
			<Checkbox
				checked={row.getIsSelected()}
				aria-label="Sélectionner la ligne"
				onCheckedChange={( value ) => row.toggleSelected( !!value )}
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		// Nom du fichier.
		accessorKey: "name",
		header: ( { column } ) => <ColumnHeader column={column} title="Nom" />
	},
	{
		// Type du fichier.
		accessorKey: "type",
		header: ( { column } ) => <ColumnHeader column={column} title="Type" />
	},
	{
		// Taille du fichier (en octets).
		accessorKey: "size",
		header: ( { column } ) => <ColumnHeader column={column} title="Taille" />,
		cell: ( { row } ) =>
		{
			// Calcul de conversion de la taille du fichier.
			//  Source : https://stackoverflow.com/q/10420352
			const units = [ "octets", "ko", "Mo", "Go", "To" ];

			let size = parseFloat( row.getValue( "size" ) );
			let index = 0;

			while ( size >= 1024 && index < units.length - 1 )
			{
				size /= 1024;
				index++;
			}

			return `${ size.toFixed( 2 ) } ${ units[ index ] }`;
		}
	},
	{
		// Date de téléversement du fichier.
		accessorKey: "date",
		header: ( { column } ) => <ColumnHeader column={column} title="Date" />,
		cell: ( { row } ) =>
		{
			const date = new Date( row.getValue( "date" ) );
			return date.toLocaleDateString( "fr-FR" );
		}
	},
	{
		// Statut de partage du fichier.
		accessorKey: "status",
		header: ( { column } ) => <ColumnHeader column={column} title="Statut" />,
		cell: ( { row } ) =>
		{
			const status: string = row.getValue( "status" );
			const getColor = () =>
			{
				switch ( status )
				{
					// Fichier privé.
					case "private":
						return "bg-red-700 hover:bg-red-900";

					// Fichier public.
					case "public":
						return "bg-green-700 hover:bg-green-900";

					// Fichier partagé.
					case "shared":
						return "bg-yellow-700 hover:bg-yellow-900";

					default:
						return "";
				}
			};

			return <Badge className={getColor()}>{status}</Badge>;
		}
	},
	{
		// Actions disponibles sur le fichier.
		id: "actions",
		cell: () => (
			<DropdownMenu>
				{/* Bouton d'ouverture du menu */}
				<DropdownMenuTrigger
					className={merge(
						buttonVariants( { variant: "ghost" } ),
						"h-8 w-8 p-0"
					)}
				>
					<span className="sr-only">Ouvrir le menu</span>

					<MoreHorizontal className="h-4 w-4" />
				</DropdownMenuTrigger>

				{/* Actions disponibles */}
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>
						Actions sur le fichier
					</DropdownMenuLabel>

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
										Êtes-vous sûr de vouloir rendre public
										ce fichier ?
									</span>
								</AlertDialogTitle>

								<AlertDialogDescription>
									En rendant ce fichier public, il sera
									accessible à tout le monde, même aux
									utilisateurs en dehors du site Internet.{" "}
									<strong>
										Les restrictions de partage seront
										réinitialisées et désactivées.
									</strong>
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction>Confirmer</AlertDialogAction>
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
									accessible aux utilisateurs en dehors du
									site Internet, ni aux utilisateurs non
									autorisés via les options de partage.{" "}
									<strong>
										Le fichier peut encore être accessible
										si celui-ci a été mis en cache par un
										tiers.
									</strong>
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction>Confirmer</AlertDialogAction>
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
										Êtes-vous sûr de vouloir supprimer tous
										les partages du fichier ?
									</span>
								</AlertDialogTitle>

								<AlertDialogDescription>
									<strong>
										Cette action est irréversible.
									</strong>{" "}
									Elle supprimera tous les partages du fichier
									et rendra le fichier privé.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction>Confirmer</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<DropdownMenuSeparator />

					{/* Accès et suppression */}
					<a
						rel="noopener noreferrer"
						href="https://www.google.fr/"
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
									Accéder et restaurer une version antérieure
									du fichier.
								</DialogDescription>
							</DialogHeader>

							<FileHistory />
						</DialogContent>
					</Dialog>

					<DropdownMenuItem>
						<ClipboardCopy className="mr-2 h-4 w-4" />
						Copier le lien d&lsquo;accès
					</DropdownMenuItem>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<DropdownMenuItem
								// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
								onSelect={( event ) => event.preventDefault()}
								className="text-red-600"
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
									<strong>
										Cette action est irréversible.
									</strong>{" "}
									Elle supprimera définitivement le fichier de
									votre espace de stockage.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction>Confirmer</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}
];