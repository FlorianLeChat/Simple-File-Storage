//
// Composant de contrôle de l'affichage des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#column-toggle
//

"use client";

import { merge } from "@/utilities/tailwind";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

import { buttonVariants } from "../../components/ui/button";
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
			<DropdownMenuTrigger
				className={merge(
					buttonVariants( { size: "sm", variant: "outline" } ),
					"h-10 sm:mr-auto"
				)}
			>
				<SlidersHorizontal className="inline h-4 w-4 sm:mr-2" />

				<span className="max-sm:hidden">Voir</span>
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