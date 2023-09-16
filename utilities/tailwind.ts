//
// Fusion des classes CSS de Tailwind.
//
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export function merge( ...inputs: ClassValue[] )
{
	return twMerge( clsx( inputs ) );
}