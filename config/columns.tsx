//
// Déclaration des colonnes d'un tableau de données.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { ColumnDef } from "@tanstack/react-table";
import { formatSize } from "@/utilities/react-table";
import type { FileAttributes } from "@/interfaces/File";

import { Badge } from "@/components/ui/badge";
import RowActions from "@/dashboard/components/row-actions";
import ColumnHeader from "@/dashboard/components/column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard,
	HoverCardContent,
	HoverCardTrigger } from "@/components/ui/hover-card";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Déclaration des colonnes du tableau.
export const columns: (
	messages: Record<string, string>,
) => ColumnDef<FileAttributes>[] = ( messages: Record<string, string> ) => [
	{
		// Case de sélection d'une ou plusieurs lignes.
		id: "select",
		header: ( { table } ) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected()
					|| ( table.getIsSomePageRowsSelected() && "indeterminate" )
				}
				aria-label={messages.select_all}
				onCheckedChange={( value ) => table.toggleAllPageRowsSelected( !!value )}
			/>
		),
		cell: ( { row } ) => (
			<Checkbox
				checked={row.getIsSelected()}
				aria-label={messages.select_line}
				onCheckedChange={( value ) => row.toggleSelected( !!value )}
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		// Nom du fichier.
		accessorKey: "name",
		header: ( { column } ) => (
			<ColumnHeader column={column} title={messages.name} />
		)
	},
	{
		// Propriétaire du fichier.
		accessorKey: "owner",
		header: ( { column } ) => (
			<ColumnHeader column={column} title={messages.owner} />
		),
		cell: ( { row } ) => (
			<HoverCard>
				<HoverCardTrigger
					className={merge(
						buttonVariants( { variant: "link" } ),
						"h-auto cursor-pointer p-0 text-secondary-foreground"
					)}
				>
					{row.original.owner.name ?? row.original.owner.email}
				</HoverCardTrigger>

				<HoverCardContent className="flex w-auto items-center justify-between space-x-4">
					<Avatar>
						<AvatarImage
							src={row.original.owner.image ?? ""}
							alt={row.original.owner.name ?? ""}
						/>

						<AvatarFallback>
							{(
								row.original.owner.name
								?? row.original.owner.email
							)
								?.slice( 0, 2 )
								.toUpperCase() ?? "SFS"}
						</AvatarFallback>
					</Avatar>

					<div className="space-y-1 text-sm">
						{row.original.owner.name ? (
							<>
								<h4 className="font-medium leading-none">
									{row.original.owner.name}
								</h4>

								<p className="text-muted-foreground">
									{row.original.owner.email}
								</p>
							</>
						) : (
							<h4 className="font-medium leading-none">
								{row.original.owner.email}
							</h4>
						)}
					</div>
				</HoverCardContent>
			</HoverCard>
		)
	},
	{
		// Type du fichier.
		accessorKey: "type",
		header: ( { column } ) => (
			<ColumnHeader column={column} title={messages.type} />
		)
	},
	{
		// Taille du fichier (en octets).
		accessorKey: "size",
		header: ( { column } ) => (
			<ColumnHeader column={column} title={messages.type} />
		),
		cell: ( { row } ) => formatSize( row.original.versions[ 0 ].size )
	},
	{
		// Date de téléversement du fichier.
		accessorKey: "date",
		sortingFn: ( a, b ) =>
		{
			const dateA = a.original.versions[ 0 ].date.getTime();
			const dateB = b.original.versions[ 0 ].date.getTime();

			return dateA > dateB ? 1 : ( dateA < dateB && -1 ) || 0;
		},
		header: ( { column } ) => (
			<ColumnHeader column={column} title={messages.date} />
		),
		cell: ( { row } ) =>
		{
			const { date } = row.original.versions[ 0 ];

			return (
				<time dateTime={date.toISOString()} suppressHydrationWarning>
					{new Intl.DateTimeFormat( undefined, {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "numeric",
						minute: "numeric",
						second: "numeric"
					} ).format( date )}
				</time>
			);
		}
	},
	{
		// Statut de partage du fichier.
		accessorKey: "status",
		header: ( { column } ) => <ColumnHeader column={column} title="Statut" />,
		cell: ( { row } ) =>
		{
			const status: string = row.getValue( "status" );
			const getColor = () =>
			{
				switch ( status )
				{
					// Fichier privé.
					case "private":
						return "bg-red-700 hover:bg-red-900";

					// Fichier public.
					case "public":
						return "bg-green-700 hover:bg-green-900";

					// Fichier partagé.
					case "shared":
						return "bg-yellow-700 hover:bg-yellow-900";

					default:
						return "";
				}
			};

			return <Badge className={getColor()}>{status}</Badge>;
		}
	},
	{
		// Actions disponibles sur le fichier.
		id: "actions",
		cell: ( { table, row } ) => <RowActions table={table} row={row} />
	}
];