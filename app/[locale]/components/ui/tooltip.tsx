//
// Composant générique des info-bulles.
//  Source : https://ui.shadcn.com/docs/components/tooltip
//
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipProvider = TooltipPrimitive.Provider;

const TooltipContent = forwardRef<
	ElementRef<typeof TooltipPrimitive.Content>,
	ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>( ( { className, sideOffset = 4, ...props }, ref ) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={merge(
			"bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md",
			className
		)}
		{...props}
	/>
) );

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };