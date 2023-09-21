//
// Composant générique des séparateurs.
//  Source : https://ui.shadcn.com/docs/components/separator
//

"use client";

import { merge } from "@/utilities/tailwind";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const Separator = forwardRef<
	ElementRef<typeof SeparatorPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
	(
		{ className, orientation = "horizontal", decorative = true, ...props },
		ref
	) => (
		<SeparatorPrimitive.Root
			ref={ref}
			className={merge(
				"shrink-0 bg-border",
				orientation === "horizontal"
					? "h-[1px] w-full"
					: "h-full w-[1px]",
				className
			)}
			decorative={decorative}
			orientation={orientation}
			{...props}
		/>
	)
);

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };