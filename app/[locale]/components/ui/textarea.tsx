//
// Composant générique des zones de texte.
//  Source : https://ui.shadcn.com/docs/components/textarea
//
import { merge } from "@/utilities/tailwind";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	( { className, ...props }, ref ) => (
		<textarea
			className={merge(
				"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			ref={ref}
			{...props}
		/>
	)
);

Textarea.displayName = "Textarea";

export { Textarea };