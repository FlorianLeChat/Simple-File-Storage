//
// Déclaration des colonnes d'un tableau de données.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { formatSize } from "@/utilities/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ScissorsLineDashed } from "lucide-react";
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
export const columns: ColumnDef<FileAttributes>[] = [
	{
		// Case de sélection d'une ou plusieurs lignes.
		id: "select",
		header: ( { table } ) => (
			<Checkbox
				title={table.options.meta?.messages.select_all}
				checked={
					table.getIsAllPageRowsSelected()
					|| ( table.getIsSomePageRowsSelected() && "indeterminate" )
				}
				aria-label={table.options.meta?.messages.select_all}
				onCheckedChange={( value ) => table.toggleAllPageRowsSelected( !!value )}
			/>
		),
		cell: ( { table, row } ) => (
			<Checkbox
				title={table.options.meta?.messages.select_line}
				checked={row.getIsSelected()}
				aria-label={table.options.meta?.messages.select_line}
				onCheckedChange={( value ) => row.toggleSelected( !!value )}
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		// Nom du fichier.
		accessorKey: "name",
		header: ( { table, column } ) => (
			<ColumnHeader
				title={table.options.meta?.messages.name ?? ""}
				column={column}
				aria-label={table.options.meta?.messages.name}
			/>
		)
	},
	{
		// Propriétaire du fichier.
		accessorKey: "owner",
		header: ( { table, column } ) => (
			<ColumnHeader
				title={table.options.meta?.messages.owner ?? ""}
				column={column}
				aria-label={table.options.meta?.messages.owner}
			/>
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
		header: ( { table, column } ) => (
			<ColumnHeader
				title={table.options.meta?.messages.size ?? ""}
				column={column}
				aria-label={table.options.meta?.messages.size}
			/>
		)
	},
	{
		// Taille du fichier (en octets).
		accessorKey: "size",
		sortingFn: ( a, b ) =>
		{
			const sizeA = a.original.versions[ 0 ].size;
			const sizeB = b.original.versions[ 0 ].size;

			return sizeA > sizeB ? 1 : ( sizeA < sizeB && -1 ) || 0;
		},
		header: ( { table, column } ) => (
			<ColumnHeader
				title={table.options.meta?.messages.type ?? ""}
				column={column}
				aria-label={table.options.meta?.messages.type}
			/>
		),
		cell: ( { row } ) => formatSize( row.original.versions[ 0 ].size )
	},
	{
		// Date de téléversement du fichier (et d'expiration si définie).
		accessorKey: "date",
		sortingFn: ( a, b ) =>
		{
			const dateA = a.original.versions[ 0 ].date.getTime();
			const dateB = b.original.versions[ 0 ].date.getTime();

			return dateA > dateB ? 1 : ( dateA < dateB && -1 ) || 0;
		},
		header: ( { table, column } ) => (
			<ColumnHeader
				title={table.options.meta?.messages.date ?? ""}
				column={column}
				aria-label={table.options.meta?.messages.date}
			/>
		),
		cell: ( { table, row } ) =>
		{
			const { date } = row.original.versions[ 0 ];
			const { expiration } = row.original;

			return (
				<>
					<time
						dateTime={date.toISOString()}
						suppressHydrationWarning
					>
						{/* Date de téléversement */}
						{new Intl.DateTimeFormat( table.options.meta?.locale, {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "numeric",
							second: "numeric"
						} ).format( date )}
					</time>

					{expiration && (
						<>
							<br />
							<ScissorsLineDashed className="inline-block size-5 text-destructive" />
							<time
								dateTime={date.toISOString()}
								className="ml-1 align-middle text-muted-foreground"
								suppressHydrationWarning
							>
								{/* Date d'expiration */}
								{new Intl.DateTimeFormat(
									table.options.meta?.locale,
									{
										year: "numeric",
										month: "short",
										day: "numeric"
									}
								).format( expiration )}
							</time>
						</>
					)}
				</>
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

			return <Badge variant={status as "private"}>{status}</Badge>;
		}
	},
	{
		// Actions disponibles sur le fichier.
		id: "actions",
		cell: ( { table, row } ) => <RowActions table={table} row={row} />
	}
];