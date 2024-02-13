//
// Composant de pagination d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#pagination-1
//

"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";

interface PaginationProps<TData> {
	table: Table<TData>;
}

export default function Pagination<TData>( { table }: PaginationProps<TData> )
{
	// Déclaration des variables d'état.
	const parameters = useSearchParams();

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Nombre de lignes sélectionnées */}
			<p className="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} sur{" "}
				{table.getFilteredRowModel().rows.length} ligne(s)
				sélectionnée(s).
			</p>

			{/* Nombre de lignes par page */}
			<nav className="flex items-center space-x-2">
				<p className="text-sm font-medium">Lignes par page</p>

				<Select
					value={`${ table.getState().pagination.pageSize }`}
					onValueChange={( value ) =>
					{
						// Définition de la limite dans le tableau.
						table.setPageSize( Number( value ) );

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set( "limit", value );
						url.delete( "page" );

						window.history.pushState( null, "", `?${ url }` );
					}}
				>
					<SelectTrigger
						className="h-8 w-[70px]"
						aria-controls="page-size"
					>
						<SelectValue
							id="page-size"
							placeholder={table.getState().pagination.pageSize}
						/>
					</SelectTrigger>

					<SelectContent side="top" id="page-size">
						{[ 10, 20, 30, 40, 50 ].map( ( pageSize ) => (
							<SelectItem key={pageSize} value={`${ pageSize }`}>
								{pageSize}
							</SelectItem>
						) )}
					</SelectContent>
				</Select>
			</nav>

			{/* Changement de page */}
			<nav className="flex items-center space-x-2">
				<p className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} sur{" "}
					{table.getPageCount()}
				</p>

				<Button
					title="Aller à la première page"
					variant="outline"
					onClick={() =>
					{
						// Définition de la page dans le tableau.
						table.setPageIndex( 0 );

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set( "page", "1" );

						window.history.pushState( null, "", `?${ url }` );
					}}
					disabled={!table.getCanPreviousPage()}
					className="hidden h-8 w-8 p-0 lg:flex"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				<Button
					title="Aller à la page précédente"
					variant="outline"
					onClick={() =>
					{
						// Exécution du changement de page.
						table.previousPage();

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set(
							"page",
							`${ table.getState().pagination.pageIndex }`
						);

						window.history.pushState( null, "", `?${ url }` );
					}}
					disabled={!table.getCanPreviousPage()}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<Button
					title="Aller à la page suivante"
					variant="outline"
					onClick={() =>
					{
						// Exécution du changement de page.
						table.nextPage();

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set(
							"page",
							`${ table.getState().pagination.pageIndex + 2 }`
						);

						window.history.pushState( null, "", `?${ url }` );
					}}
					disabled={!table.getCanNextPage()}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				<Button
					title="Aller à la dernière page"
					variant="outline"
					onClick={() =>
					{
						// Définition de la page dans le tableau.
						table.setPageIndex( table.getPageCount() - 1 );

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set( "page", table.getPageCount().toString() );

						window.history.pushState( null, "", `?${ url }` );
					}}
					disabled={!table.getCanNextPage()}
					className="hidden h-8 w-8 p-0 lg:flex"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</nav>
		</>
	);
}