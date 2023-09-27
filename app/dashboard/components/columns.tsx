//
// Composant des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import ColumnHeader from "./column-header";
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
	status: "public" | "private";
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
		header: ( { column } ) => <ColumnHeader column={column} title="Statut" />
	},
	{
		// Actions disponibles sur le fichier.
		id: "actions",
		cell: () => (
			<DropdownMenu>
				{/* Bouton d'ouverture du menu */}
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Ouvrir le menu</span>

						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>

				{/* Actions disponibles */}
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>
						Actions sur le fichier
					</DropdownMenuLabel>

					{/* Partages */}
					<DropdownMenuItem>Autoriser le partage</DropdownMenuItem>
					<DropdownMenuItem>Restreindre le partage</DropdownMenuItem>
					<DropdownMenuItem>
						Supprimer tous les partages
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Accès et gestion */}
					<DropdownMenuItem>Accéder</DropdownMenuItem>
					<DropdownMenuItem>
						Copier le lien d&lsquo;accès
					</DropdownMenuItem>
					<DropdownMenuItem>
						Supprimer définitivement
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}
];