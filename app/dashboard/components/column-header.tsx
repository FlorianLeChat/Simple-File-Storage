//
// Composant des en-têtes de colonnes d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table#column-header
//
import { merge } from "@/utilities/tailwind";
import { Column } from "@tanstack/react-table";
import { type HTMLAttributes } from "react";
import { EyeOff, ArrowUp, ArrowDown, ArrowDownUp } from "lucide-react";

import { buttonVariants } from "../../components/ui/button";
import { DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

interface ColumnHeaderProps<TData, TValue>
	extends HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export default function ColumnHeader<TData, TValue>( {
	column,
	title
}: ColumnHeaderProps<TData, TValue> )
{
	// Vérification de la possibilité de trier la colonne.
	if ( !column.getCanSort() )
	{
		return title;
	}

	// Affichage du rendu HTML du composant.
	return (
		<div className="flex items-center space-x-2">
			<DropdownMenu>
				{/* Icon de tri */}
				<DropdownMenuTrigger
					className={merge(
						buttonVariants( { size: "sm", variant: "ghost" } ),
						"-ml-3 h-8 data-[state=open]:bg-accent"
					)}
				>
					<span>{title}</span>

					{( column.getIsSorted() === "desc" && (
						<ArrowDown className="ml-2 h-4 w-4" />
					) )
						|| ( column.getIsSorted() === "asc" ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : (
							<ArrowDownUp className="ml-2 h-4 w-4" />
						) )}
				</DropdownMenuTrigger>

				{/* Options de tri disponibles */}
				<DropdownMenuContent align="start">
					<DropdownMenuItem
						onClick={() => column.toggleSorting( false )}
					>
						<ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Ascendant
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => column.toggleSorting( true )}
					>
						<ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Descendant
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => column.toggleVisibility( false )}
					>
						<EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
						Cacher
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}