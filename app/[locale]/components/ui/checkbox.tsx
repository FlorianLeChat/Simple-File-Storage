//
// Composant générique des cases à cocher.
//  Source : https://ui.shadcn.com/docs/components/checkbox
//
import { Check } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

const Checkbox = forwardRef<
	ElementRef<typeof CheckboxPrimitive.Root>,
	ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>( ( { className, ...props }, ref ) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={merge(
			"border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={merge( "flex items-center justify-center text-current" )}
		>
			<Check className="size-4" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
) );

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };