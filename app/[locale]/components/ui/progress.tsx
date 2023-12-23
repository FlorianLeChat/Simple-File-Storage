//
// Composant générique de la barre de progression.
//  Source : https://ui.shadcn.com/docs/components/progress
//
import { merge } from "@/utilities/tailwind";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const Progress = forwardRef<
	ElementRef<typeof ProgressPrimitive.Root>,
	ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>( ( { className, value, ...props }, ref ) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={merge(
			"relative h-4 w-full overflow-hidden rounded-full bg-secondary",
			className
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className="h-full w-full flex-1 bg-primary transition-all"
			style={{ transform: `translateX(-${ 100 - ( value || 0 ) }%)` }}
		/>
	</ProgressPrimitive.Root>
) );

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };