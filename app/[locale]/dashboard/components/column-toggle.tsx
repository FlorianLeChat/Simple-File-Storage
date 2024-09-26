//
// Composant de contrôle de l'affichage des colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#column-toggle
//

"use client";

import { merge } from "@/utilities/tailwind";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { FileAttributes } from "@/interfaces/File";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

import { buttonVariants } from "../../components/ui/button";
import { DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem } from "../../components/ui/dropdown-menu";

export default function ColumnToggle( {
	table
}: {
	table: Table<FileAttributes>;
} )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "dashboard" );
	const parameters = useSearchParams();

	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu modal={false}>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger
				className={merge(
					buttonVariants( { size: "sm", variant: "outline" } ),
					"h-10 md:mr-auto"
				)}
			>
				<SlidersHorizontal className="inline h-4 w-4 md:mr-2" />

				<span className="max-md:hidden">{messages( "columns" )}</span>
			</DropdownMenuTrigger>

			{/* Menu de sélection des colonnes */}
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>
					{messages( "active_columns" )}
				</DropdownMenuLabel>

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
							onCheckedChange={( value ) =>
							{
								// Affichage/masquage de la colonne.
								column.toggleVisibility( !!value );

								// Mise à jour de l'URL.
								const url = new URLSearchParams( parameters );

								if ( value )
								{
									url.delete( "hide", column.id );
								}
								else
								{
									url.append( "hide", column.id );
								}

								window.history.pushState( null, "", `?${ url }` );
							}}
						>
							{messages( column.id )}
						</DropdownMenuCheckboxItem>
					) )}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}