//
// Composant générique des squelettes de chargement.
//  Source : https://ui.shadcn.com/docs/components/skeleton
//
import { merge } from "@/utilities/tailwind";
import type { HTMLAttributes } from "react";

function Skeleton( { className, ...props }: HTMLAttributes<HTMLDivElement> )
{
	return (
		<div
			className={merge( "animate-pulse rounded-md bg-muted", className )}
			{...props}
		/>
	);
}

export { Skeleton };