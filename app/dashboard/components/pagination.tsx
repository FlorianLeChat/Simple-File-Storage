//
// Composant de pagination d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#pagination-1
//
import { Table } from "@tanstack/react-table";
import { ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight } from "lucide-react";

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
	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Nombre de lignes sélectionnées */}
			<p className="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} sur{" "}
				{table.getFilteredRowModel().rows.length} ligne(s)
				sélectionnée(s).
			</p>

			{/* Contrôles de pagination */}
			<div className="flex items-center space-x-6 lg:space-x-8">
				{/* Nombre de lignes par page */}
				<nav className="flex items-center space-x-2">
					<p className="text-sm font-medium">Lignes par page</p>

					<Select
						value={`${ table.getState().pagination.pageSize }`}
						onValueChange={( value ) =>
						{
							table.setPageSize( Number( value ) );
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue
								placeholder={
									table.getState().pagination.pageSize
								}
							/>
						</SelectTrigger>

						<SelectContent side="top">
							{[ 10, 20, 30, 40, 50 ].map( ( pageSize ) => (
								<SelectItem
									key={pageSize}
									value={`${ pageSize }`}
								>
									{pageSize}
								</SelectItem>
							) )}
						</SelectContent>
					</Select>
				</nav>

				{/* Numéro de page */}
				<p className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} sur{" "}
					{table.getPageCount()}
				</p>

				{/* Changement de page */}
				<nav className="flex items-center space-x-2">
					<Button
						variant="outline"
						onClick={() => table.setPageIndex( 0 )}
						disabled={!table.getCanPreviousPage()}
						className="hidden h-8 w-8 p-0 lg:flex"
					>
						<span className="sr-only">
							Aller à la première page
						</span>

						<ChevronsLeft className="h-4 w-4" />
					</Button>

					<Button
						variant="outline"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="h-8 w-8 p-0"
					>
						<span className="sr-only">
							Aller à la page précédente
						</span>

						<ChevronLeft className="h-4 w-4" />
					</Button>

					<Button
						variant="outline"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="h-8 w-8 p-0"
					>
						<span className="sr-only">
							Aller à la page suivante
						</span>

						<ChevronRight className="h-4 w-4" />
					</Button>

					<Button
						variant="outline"
						onClick={() => table.setPageIndex( table.getPageCount() - 1 )}
						disabled={!table.getCanNextPage()}
						className="hidden h-8 w-8 p-0 lg:flex"
					>
						<span className="sr-only">
							Aller à la dernière page
						</span>

						<ChevronsRight className="h-4 w-4" />
					</Button>
				</nav>
			</div>
		</>
	);
}