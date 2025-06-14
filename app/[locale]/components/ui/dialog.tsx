//
// Composant générique des boîtes de dialogue.
//  Source : https://ui.shadcn.com/docs/components/dialog
//
import { X } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type HTMLAttributes,
	type ComponentPropsWithoutRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
	ElementRef<typeof DialogPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>( ( { className, ...props }, ref ) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={merge(
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
			className
		)}
		{...props}
	/>
) );

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = forwardRef<
	ElementRef<typeof DialogPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>( ( { className, children, ...props }, ref ) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={merge(
				"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
				className
			)}
			{...props}
		>
			{children}
			<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
				<X className="size-4" />
				<span className="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPortal>
) );

DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader( { className, ...props }: HTMLAttributes<HTMLDivElement> )
{
	return (
		<div
			className={merge( "flex flex-col space-y-1.5", className )}
			{...props}
		/>
	);
}

DialogHeader.displayName = "DialogHeader";

function DialogFooter( { className, ...props }: HTMLAttributes<HTMLDivElement> )
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

DialogFooter.displayName = "DialogFooter";

const DialogTitle = forwardRef<
	ElementRef<typeof DialogPrimitive.Title>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>( ( { className, ...props }, ref ) => (
	<DialogPrimitive.Title
		ref={ref}
		className={merge(
			"text-lg font-semibold leading-none tracking-tight",
			className
		)}
		{...props}
	/>
) );

DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
	ElementRef<typeof DialogPrimitive.Description>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>( ( { className, ...props }, ref ) => (
	<DialogPrimitive.Description
		ref={ref}
		className={merge( "text-muted-foreground text-sm", className )}
		{...props}
	/>
) );

DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription
};