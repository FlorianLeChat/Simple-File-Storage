//
// Composant de contrôle de l'affichage des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#column-toggle
//

"use client";

import { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

import { Button } from "../../components/ui/button";
import { DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem } from "../../components/ui/dropdown-menu";

interface ColumnToggleProps<TData> {
	table: Table<TData>;
}

export default function ColumnToggle<TData>( {
	table
}: ColumnToggleProps<TData> )
{
	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					className="ml-auto hidden h-8 lg:flex"
				>
					<SlidersHorizontal className="mr-2 h-4 w-4" />
					Voir
				</Button>
			</DropdownMenuTrigger>

			{/* Menu de sélection des colonnes */}
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Affichage des colonnes</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{table
					.getAllColumns()
					.filter(
						( column ) => typeof column.accessorFn !== "undefined"
							&& column.getCanHide()
					)
					.map( ( column ) => (
						<DropdownMenuCheckboxItem
							key={column.id}
							checked={column.getIsVisible()}
							className="capitalize"
							onCheckedChange={( value ) => column.toggleVisibility( !!value )}
						>
							{column.id}
						</DropdownMenuCheckboxItem>
					) )}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}