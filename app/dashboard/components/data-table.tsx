//
// Composant de visualisation et de gestion des données d'un tableau.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

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
import { Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader } from "../../components/ui/table";
import Pagination from "./pagination";
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
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getPaginationRowModel: getPaginationRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			rowSelection,
			columnFilters,
			columnVisibility
		}
	} );

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Filtrage et tri des données */}
			<search className="flex items-center py-4">
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

				{/* Sélection des colonnes à afficher */}
				<ColumnToggle table={table} />
			</search>

			{/* Affichage des données dans le tableau */}
			<Table className="rounded-md border">
				{/* Éléments de l'en-tête */}
				<TableHeader>
					{table.getHeaderGroups().map( ( headerGroup ) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map( ( header ) => (
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
								Aucun résultat.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{/* Contrôles de pagination */}
			<aside className="flex items-center justify-end space-x-2 py-4">
				<Pagination table={table} />
			</aside>
		</>
	);
}