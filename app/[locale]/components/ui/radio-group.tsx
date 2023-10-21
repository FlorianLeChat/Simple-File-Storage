//
// Composant générique des groupes de boutons radio.
//  Source : https://ui.shadcn.com/docs/components/radio-group
//
import { merge } from "@/utilities/tailwind";
import { Circle } from "lucide-react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const RadioGroup = forwardRef<
	ElementRef<typeof RadioGroupPrimitive.Root>,
	ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>( ( { className, ...props }, ref ) => (
	<RadioGroupPrimitive.Root
		className={merge( "grid gap-2", className )}
		{...props}
		ref={ref}
	/>
) );

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = forwardRef<
	ElementRef<typeof RadioGroupPrimitive.Item>,
	ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>( ( { className, ...props }, ref ) => (
	<RadioGroupPrimitive.Item
		ref={ref}
		className={merge(
			"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{...props}
	>
		<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
			<Circle className="h-2.5 w-2.5 fill-current text-current" />
		</RadioGroupPrimitive.Indicator>
	</RadioGroupPrimitive.Item>
) );

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };