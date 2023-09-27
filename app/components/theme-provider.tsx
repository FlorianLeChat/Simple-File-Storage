//
// Composant de basculement entre les thèmes clair et sombre.
//

"use client";

import { type ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider( {
	children,
	...props
}: ThemeProviderProps )
{
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}