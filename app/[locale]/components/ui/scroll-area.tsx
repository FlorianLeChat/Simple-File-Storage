//
// Composant générique des zones de défilement.
//  Source : https://ui.shadcn.com/docs/components/scroll-area
//
import { merge } from "@/utilities/tailwind";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const ScrollBar = forwardRef<
	ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>( ( { className, orientation = "vertical", ...props }, ref ) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={merge(
			"flex touch-none select-none transition-colors",
			orientation === "vertical"
				&& "h-full w-2.5 border-l border-l-transparent p-[1px]",
			orientation === "horizontal"
				&& "h-2.5 border-t border-t-transparent p-[1px]",
			className
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb
			className={merge(
				"relative rounded-full bg-border",
				orientation === "vertical" && "flex-1"
			)}
		/>
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
) );

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

const ScrollArea = forwardRef<
	ElementRef<typeof ScrollAreaPrimitive.Root>,
	ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>( ( { className, children, ...props }, ref ) => (
	<ScrollAreaPrimitive.Root
		ref={ref}
		className={merge( "relative overflow-hidden", className )}
		{...props}
	>
		<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollBar />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
) );

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea, ScrollBar };