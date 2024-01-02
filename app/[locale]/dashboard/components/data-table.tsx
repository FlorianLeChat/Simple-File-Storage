//
// Composant de visualisation et de gestion des données d'un tableau.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { ColumnDef,
	flexRender,
	SortingState,
	useReactTable,
	VisibilityState,
	getCoreRowModel,
	getSortedRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel } from "@tanstack/react-table";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader } from "../../components/ui/table";

import Pagination from "./pagination";
import FileUpload from "./file-upload";
import ColumnToggle from "./column-toggle";
import type { File } from "./columns";

export default function DataTable( {
	columns,
	data
}: {
	columns: ColumnDef<File>[];
	data: File[];
} )
{
	// Déclaration des variables d'état.
	const [ sorting, setSorting ] = useState<SortingState>( [] );
	const [ rowSelection, setRowSelection ] = useState( {} );
	const [ columnFilters, setColumnFilters ] = useState<ColumnFiltersState>( [] );
	const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>(
		{}
	);

	// Définition des tableaux.
	const table = useReactTable( {
		data,
		state: {
			sorting,
			rowSelection,
			columnFilters,
			columnVisibility
		},
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility
	} );

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Filtrage et tri des données */}
			<div className="flex items-center gap-2 py-4">
				{/* Filtrage par nom */}
				<Input
					value={
						( table.getColumn( "name" )?.getFilterValue() as string )
						?? ""
					}
					onChange={( event ) => table
						.getColumn( "name" )
						?.setFilterValue( event.target.value )}
					className="max-w-sm"
					placeholder="Filtrer par nom"
				/>

				{/* Réinitialisation du filtrage */}
				{table.getState().columnFilters.length > 0 && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="px-3"
					>
						<X className="inline h-4 w-4 sm:mr-2" />

						<span className="max-sm:hidden">Réinitialiser</span>
					</Button>
				)}

				{/* Sélection des colonnes à afficher */}
				<ColumnToggle table={table} />

				{/* Ajout d'une nouvelle entrée */}
				<FileUpload />
			</div>

			{/* Affichage des données dans le tableau */}
			<Table className="rounded-md border">
				{/* Éléments de l'en-tête */}
				<TableHeader>
					{table.getHeaderGroups().map( ( group ) => (
						<TableRow key={group.id}>
							{group.headers.map( ( header ) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
								</TableHead>
							) )}
						</TableRow>
					) )}
				</TableHeader>

				{/* Colonnes et lignes */}
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map( ( row ) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map( ( cell ) => (
									<TableCell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</TableCell>
								) )}
							</TableRow>
						) )
					) : (
						<TableRow>
							{/* Résultat de la recherche */}
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								Aucun fichier trouvé.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{/* Contrôles de pagination */}
			<aside className="flex items-center justify-end gap-2 py-4 max-sm:flex-col sm:gap-4 lg:gap-8">
				<Pagination table={table} />
			</aside>
		</>
	);
}