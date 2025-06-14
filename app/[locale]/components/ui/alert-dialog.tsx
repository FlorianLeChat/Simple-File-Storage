//
// Composant générique de la fenêtre modale d'alerte.
//  Source : https://ui.shadcn.com/docs/components/alert-dialog
//
import { merge } from "@/utilities/tailwind";
import { buttonVariants } from "./button";
import { forwardRef,
	type ElementRef,
	type HTMLAttributes,
	type ComponentPropsWithoutRef } from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPrimitive.Overlay
		className={merge(
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
			className
		)}
		{...props}
		ref={ref}
	/>
) );

AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Content>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			className={merge(
				"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
				className
			)}
			{...props}
		/>
	</AlertDialogPortal>
) );

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function AlertDialogHeader( {
	className,
	...props
}: HTMLAttributes<HTMLDivElement> )
{
	return (
		<div
			className={merge( "flex flex-col space-y-2", className )}
			{...props}
		/>
	);
}

AlertDialogHeader.displayName = "AlertDialogHeader";

function AlertDialogFooter( {
	className,
	...props
}: HTMLAttributes<HTMLDivElement> )
{
	return (
		<div
			className={merge(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className
			)}
			{...props}
		/>
	);
}

AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Title>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={merge( "text-lg font-semibold", className )}
		{...props}
	/>
) );

AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Description>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={merge( "text-muted-foreground text-sm", className )}
		{...props}
	/>
) );

AlertDialogDescription.displayName
	= AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Action>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={merge( buttonVariants(), className )}
		{...props}
	/>
) );

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = forwardRef<
	ElementRef<typeof AlertDialogPrimitive.Cancel>,
	ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>( ( { className, ...props }, ref ) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={merge(
			buttonVariants( { variant: "outline" } ),
			"mt-2 sm:mt-0",
			className
		)}
		{...props}
	/>
) );

AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel
};