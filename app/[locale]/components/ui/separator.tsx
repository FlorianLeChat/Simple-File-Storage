//
// Composant générique des séparateurs.
//  Source : https://ui.shadcn.com/docs/components/separator
//

"use client";

import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

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
			decorative={decorative}
			orientation={orientation}
			className={merge(
				"bg-border shrink-0",
				orientation === "horizontal"
					? "h-[1px] w-full"
					: "h-full w-[1px]",
				className
			)}
			{...props}
		/>
	)
);

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };