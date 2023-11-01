//
// Composant des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "../../components/ui/badge";
import RowActions from "./row-actions";
import ColumnHeader from "./column-header";
import { Checkbox } from "../../components/ui/checkbox";

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
		cell: () => <RowActions />
	}
];