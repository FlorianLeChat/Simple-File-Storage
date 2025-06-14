//
// Composant générique de la barre de progression.
//  Source : https://ui.shadcn.com/docs/components/progress
//
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

const Progress = forwardRef<
	ElementRef<typeof ProgressPrimitive.Root>,
	ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>( ( { className, value, ...props }, ref ) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={merge(
			"bg-secondary relative h-4 w-full overflow-hidden rounded-full",
			className
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className="bg-primary size-full flex-1 transition-all"
			style={{ transform: `translateX(-${ 100 - ( value ?? 0 ) }%)` }}
		/>
	</ProgressPrimitive.Root>
) );

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };