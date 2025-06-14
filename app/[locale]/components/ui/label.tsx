//
// Composant générique des libellés.
//  Source : https://ui.shadcn.com/docs/components/label
//
import { merge } from "@/utilities/tailwind";
import { cva, type VariantProps } from "class-variance-authority";
import { Label as LabelPrimitive } from "radix-ui";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = forwardRef<
	ElementRef<typeof LabelPrimitive.Root>,
	ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
	VariantProps<typeof labelVariants>
>( ( { className, ...props }, ref ) => (
	<LabelPrimitive.Root
		ref={ref}
		className={merge( labelVariants(), className )}
		{...props}
	/>
) );

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };