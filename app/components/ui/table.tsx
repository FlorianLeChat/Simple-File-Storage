//
// Composant générique des tableaux.
//  Source : https://ui.shadcn.com/docs/components/table
//
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type HTMLAttributes,
	type TdHTMLAttributes,
	type ThHTMLAttributes } from "react";

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
	( { className, ...props }, ref ) => (
		<div className="relative w-full overflow-auto">
			<table
				ref={ref}
				className={merge( "w-full caption-bottom text-sm", className )}
				{...props}
			/>
		</div>
	)
);

Table.displayName = "Table";

const TableHeader = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>( ( { className, ...props }, ref ) => (
	<thead
		ref={ref}
		className={merge( "[&_tr]:border-b", className )}
		{...props}
	/>
) );

TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>( ( { className, ...props }, ref ) => (
	<tbody
		ref={ref}
		className={merge( "[&_tr:last-child]:border-0", className )}
		{...props}
	/>
) );

TableBody.displayName = "TableBody";

const TableFooter = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>( ( { className, ...props }, ref ) => (
	<tfoot
		ref={ref}
		className={merge(
			"bg-primary font-medium text-primary-foreground",
			className
		)}
		{...props}
	/>
) );

TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<
	HTMLTableRowElement,
	HTMLAttributes<HTMLTableRowElement>
>( ( { className, ...props }, ref ) => (
	<tr
		ref={ref}
		className={merge(
			"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
			className
		)}
		{...props}
	/>
) );

TableRow.displayName = "TableRow";

const TableHead = forwardRef<
	HTMLTableCellElement,
	ThHTMLAttributes<HTMLTableCellElement>
>( ( { className, ...props }, ref ) => (
	<th
		ref={ref}
		className={merge(
			"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
			className
		)}
		{...props}
	/>
) );

TableHead.displayName = "TableHead";

const TableCell = forwardRef<
	HTMLTableCellElement,
	TdHTMLAttributes<HTMLTableCellElement>
>( ( { className, ...props }, ref ) => (
	<td
		ref={ref}
		className={merge(
			"p-4 align-middle [&:has([role=checkbox])]:pr-0",
			className
		)}
		{...props}
	/>
) );

TableCell.displayName = "TableCell";

const TableCaption = forwardRef<
	HTMLTableCaptionElement,
	HTMLAttributes<HTMLTableCaptionElement>
>( ( { className, ...props }, ref ) => (
	<caption
		ref={ref}
		className={merge( "mt-4 text-sm text-muted-foreground", className )}
		{...props}
	/>
) );

TableCaption.displayName = "TableCaption";

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption
};