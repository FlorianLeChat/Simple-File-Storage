//
// Composant générique des cartes de contenu.
//  Source : https://ui.shadcn.com/docs/components/hover-card
//
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = forwardRef<
	ElementRef<typeof HoverCardPrimitive.Content>,
	ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>( ( { className, align = "center", sideOffset = 4, ...props }, ref ) => (
	<HoverCardPrimitive.Content
		ref={ref}
		align={align}
		className={merge(
			"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-md border p-4 shadow-md outline-none",
			className
		)}
		sideOffset={sideOffset}
		{...props}
	/>
) );

HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };