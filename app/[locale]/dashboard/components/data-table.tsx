//
// Composant de visualisation et de gestion des données d'un tableau.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { type TableMeta,
	flexRender,
	SortingState,
	useReactTable,
	VisibilityState,
	getCoreRowModel,
	getSortedRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel } from "@tanstack/react-table";
import type { FileAttributes } from "@/interfaces/File";

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
import { columns } from "./columns";
import ColumnToggle from "./column-toggle";

export default function DataTable( { data }: { data: FileAttributes[] } )
{
	// Déclaration des variables d'état.
	const parameters = useSearchParams();
	const [ files, setFiles ] = useState( data );
	const [ loading, setLoading ] = useState( false );
	const [ sorting, setSorting ] = useState<SortingState>( [
		{
			id: parameters.get( "asc" ) ?? parameters.get( "desc" ) ?? "name",
			desc: parameters.get( "desc" ) !== null
		}
	] );
	const [ rowSelection, setRowSelection ] = useState( {} );
	const [ columnFilters, setColumnFilters ] = useState<ColumnFiltersState>(
		parameters.get( "filter" )
			? [
				{
					id: "name",
					value: parameters.get( "filter" ) ?? ""
				}
			]
			: []
	);
	const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>( {
		...{
			date: true,
			name: true,
			size: true,
			type: true,
			owner: true,
			status: true
		},
		...Object.fromEntries(
			parameters.getAll( "hide" ).map( ( option ) => [ option, false ] )
		)
	} );

	// Définition des tableaux.
	const page = Number( parameters.get( "page" ) ?? 1 ) - 1;
	const limit = Number( parameters.get( "limit" ) ?? 10 );
	const table = useReactTable( {
		data: files,
		meta: {
			files,
			loading,
			setFiles,
			setLoading
		},
		state: {
			sorting,
			rowSelection,
			columnFilters,
			columnVisibility
		},
		columns,
		getRowId: ( row ) => row.uuid,
		initialState: {
			pagination: {
				pageSize: limit,
				pageIndex:
					parameters.get( "filter" ) || files.length / limit <= 1
						? 0
						: page
			}
		},
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
		<SessionProvider
			basePath={`${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/auth`}
		>
			{/* Filtrage et tri des données */}
			<div className="flex items-center gap-2 py-4">
				{/* Filtrage par nom */}
				<Input
					value={
						parameters.get( "filter" )
						?? ( table.getColumn( "name" )?.getFilterValue() as string )
						?? ""
					}
					onChange={( event ) =>
					{
						// Définition du filtre dans le tableau.
						table
							.getColumn( "name" )
							?.setFilterValue( event.target.value );

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );

						if ( event.target.value.length > 0 )
						{
							url.set( "filter", event.target.value );
						}
						else
						{
							url.delete( "filter" );
						}

						window.history.pushState( null, "", `?${ url }` );
					}}
					className="max-w-sm"
					placeholder="Filtrer par nom"
				/>

				{/* Réinitialisation du filtrage */}
				{table.getState().columnFilters.length > 0 && (
					<Button
						variant="ghost"
						onClick={() =>
						{
							// Réinitialisation du filtre dans le tableau.
							table.resetColumnFilters();

							// Mise à jour de l'URL.
							const url = new URLSearchParams( parameters );
							url.delete( "filter" );

							window.history.pushState( null, "", `?${ url }` );
						}}
						className="px-3"
					>
						<X className="inline h-4 w-4 sm:mr-2" />

						<p className="max-sm:hidden">Réinitialiser</p>
					</Button>
				)}

				{/* Sélection des colonnes à afficher */}
				<ColumnToggle table={table} />

				{/* Ajout d'une nouvelle entrée */}
				<FileUpload
					states={table.options.meta as TableMeta<FileAttributes>}
				/>
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
		</SessionProvider>
	);
}