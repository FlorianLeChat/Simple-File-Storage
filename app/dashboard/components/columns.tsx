//
// Composant des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { merge } from "@/utilities/tailwind";
import { ColumnDef } from "@tanstack/react-table";
import { Trash,
	UserX,
	Share2,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal } from "lucide-react";

import { Badge } from "../../components/ui/badge";
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
								<DialogTitle>Partage du fichier</DialogTitle>

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
									Êtes-vous sûr de vouloir supprimer tous les
									partages du fichier ?
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
							Accéder
						</DropdownMenuItem>
					</a>

					<DropdownMenuSeparator />

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
									Êtes-vous sûr de vouloir supprimer ce
									fichier ?
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