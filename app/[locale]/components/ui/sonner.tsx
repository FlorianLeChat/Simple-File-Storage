//
// Composant générique des notifications.
//  Source : https://ui.shadcn.com/docs/components/sonner
//

"use client";

import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

function Toaster( { ...props }: ToasterProps )
{
	return (
		<Sonner
			className="toaster group"
			richColors
			closeButton
			toastOptions={{
				classNames: {
					toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
				}
			}}
			{...props}
		/>
	);
}

export default Toaster;