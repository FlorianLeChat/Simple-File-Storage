//
// Composant générique des champs de saisie.
//  Source : https://ui.shadcn.com/docs/components/input
//
import { merge } from "@/utilities/tailwind";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
	( { className, type, ...props }, ref ) => (
		<input
			ref={ref}
			type={type}
			className={merge(
				"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
	)
);

Input.displayName = "Input";

export { Input };