//
// Composant de visualisation et de gestion des données d'un tableau.
//  Source : https://ui.shadcn.com/docs/components/data-table
//

"use client";

import { X } from "lucide-react";
import { columns } from "@/config/columns";
import { useState } from "react";
import { useMessages } from "next-intl";
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
import ColumnToggle from "./column-toggle";

export default function DataTable( { data }: { data: FileAttributes[] } )
{
	// Déclaration des variables d'état.
	const messages = useMessages() as {
		dashboard: Record<string, string>;
	};
	const parameters = useSearchParams();
	const [ files, setFiles ] = useState( data );
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
			setFiles
		},
		state: {
			sorting,
			rowSelection,
			columnFilters,
			columnVisibility
		},
		columns: columns( messages.dashboard ),
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

	// Récupération des données du tableau.
	const { rows } = table.getRowModel();

	// Affichage du rendu HTML du composant.
	return (
		<SessionProvider
			basePath={`${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/auth`}
		>
			{/* Filtrage et tri des données */}
			<div className="mb-4 flex items-center gap-2">
				{/* Filtrage par nom */}
				<Input
					name="filter"
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
					className="md:max-w-sm"
					placeholder={messages.dashboard.filter}
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

						<p className="max-sm:hidden">
							{messages.dashboard.reset}
						</p>
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
				<TableHeader className="max-sm:hidden">
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

				{/* Lignes du tableau */}
				<TableBody>
					{rows.length === 0 && (
						<TableRow>
							{/* Aucun fichier trouvé */}
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center"
							>
								{messages.dashboard.no_files}
							</TableCell>
						</TableRow>
					)}

					{rows.map( ( row ) => (
						<TableRow
							key={row.id}
							className="max-sm:flex max-sm:flex-col max-sm:gap-4 max-sm:p-4"
							data-state={row.getIsSelected() && "selected"}
						>
							{/* Fichiers trouvés */}
							{row.getVisibleCells().map( ( cell ) => (
								<TableCell
									key={cell.id}
									className="max-sm:p-0"
									suppressHydrationWarning
								>
									{table
										.getHeaderGroups()[ 0 ]
										.headers.filter(
											// Filtrage des colonnes à afficher.
											( header ) => header.id === cell.column.id
												&& header.id !== "select"
										)
										.map( ( header ) => (
											<span
												key={header.id}
												className="sm:hidden"
											>
												{header.isPlaceholder
													? null
													: flexRender(
														header.column
															.columnDef
															.header,
														header.getContext()
													)}
											</span>
										) )}

									{/* Séparateur */}
									{cell.column.id !== "select"
										&& cell.column.id !== "actions" && (
										<br className="sm:hidden" />
									)}

									{/* Données */}
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</TableCell>
							) )}
						</TableRow>
					) )}
				</TableBody>
			</Table>

			{/* Contrôles de pagination */}
			<Pagination table={table} />
		</SessionProvider>
	);
}