//
// Composant de pagination d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#pagination-1
//

"use client";

import { ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";

interface PaginationProps<TData>
{
	table: Table<TData>;
}

export default function Pagination<TData>( { table }: Readonly<PaginationProps<TData>> )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "dashboard" );
	const parameters = useSearchParams();

	// Déclaration des constantes.
	const maxPages = table.getPageCount();
	const currentPage = Math.min(
		table.getState().pagination.pageIndex + 1,
		maxPages
	);

	// Affichage du rendu HTML du composant.
	return (
		<div className="mt-4 flex items-center justify-end gap-2 max-md:flex-col md:gap-4 lg:gap-8">
			{/* Nombre de lignes sélectionnées */}
			<p className="flex-1 text-sm text-muted-foreground">
				{messages.rich( "rows_x", {
					selected: table.getFilteredSelectedRowModel().rows.length,
					total: table.getFilteredRowModel().rows.length
				} )}
			</p>

			{/* Nombre de lignes par page */}
			<nav className="flex items-center space-x-2">
				<p className="text-sm font-medium">
					{messages( "lines_per_page" )}
				</p>

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
					{messages( "pages_x", {
						page: currentPage,
						pages: maxPages
					} )}
				</p>

				<Button
					title={messages( "first_page" )}
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
					className="hidden size-8 p-0 lg:flex"
					aria-label={messages( "first_page" )}
				>
					<ChevronsLeft className="size-4" />
				</Button>

				<Button
					title={messages( "previous_page" )}
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
					className="size-8 p-0"
					aria-label={messages( "previous_page" )}
				>
					<ChevronLeft className="size-4" />
				</Button>

				<Button
					title={messages( "next_page" )}
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
					className="size-8 p-0"
					aria-label={messages( "next_page" )}
				>
					<ChevronRight className="size-4" />
				</Button>

				<Button
					title={messages( "last_page" )}
					variant="outline"
					onClick={() =>
					{
						// Définition de la page dans le tableau.
						table.setPageIndex( maxPages - 1 );

						// Mise à jour de l'URL.
						const url = new URLSearchParams( parameters );
						url.set( "page", maxPages.toString() );

						window.history.pushState( null, "", `?${ url }` );
					}}
					disabled={!table.getCanNextPage()}
					className="hidden size-8 p-0 lg:flex"
					aria-label={messages( "last_page" )}
				>
					<ChevronsRight className="size-4" />
				</Button>
			</nav>
		</div>
	);
}