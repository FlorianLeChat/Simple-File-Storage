//
// Composant générique des formulaires.
//  Source : https://ui.shadcn.com/docs/components/form
//
import { Slot } from "@radix-ui/react-slot";
import { merge } from "@/utilities/tailwind";
import { Controller,
	FieldPath,
	FieldValues,
	FormProvider,
	useFormContext,
	ControllerProps } from "react-hook-form";
import * as LabelPrimitive from "@radix-ui/react-label";
import { useId,
	useMemo,
	useContext,
	forwardRef,
	createContext,
	type ElementRef,
	type HTMLAttributes,
	type ComponentPropsWithoutRef } from "react";

import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
);

function FormField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>( { ...props }: ControllerProps<TFieldValues, TName> )
{
	const name = useMemo( () => ( { name: props.name } ), [ props.name ] );

	return (
		<FormFieldContext.Provider value={name}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
}

type FormItemContextValue = {
	id: string;
};

const FormItemContext = createContext<FormItemContextValue>(
	{} as FormItemContextValue
);

const useFormField = () =>
{
	const fieldContext = useContext( FormFieldContext );
	const itemContext = useContext( FormItemContext );
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState( fieldContext.name, formState );

	if ( !fieldContext )
	{
		throw new Error( "useFormField should be used within <FormField>" );
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${ id }-form-item`,
		formDescriptionId: `${ id }-form-item-description`,
		formMessageId: `${ id }-form-item-message`,
		...fieldState
	};
};

const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	( { className, ...props }, ref ) =>
	{
		const id = useId();
		const cache = useMemo( () => ( { id } ), [ id ] );

		return (
			<FormItemContext.Provider value={cache}>
				<div
					ref={ref}
					className={merge( "space-y-2", className )}
					{...props}
				/>
			</FormItemContext.Provider>
		);
	}
);

FormItem.displayName = "FormItem";

const FormLabel = forwardRef<
	ElementRef<typeof LabelPrimitive.Root>,
	ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>( ( { className, ...props }, ref ) =>
{
	const { error, formItemId } = useFormField();

	return (
		<Label
			ref={ref}
			htmlFor={formItemId}
			className={merge(
				error && "text-destructive",
				className,
				"inline-block"
			)}
			{...props}
		/>
	);
} );

FormLabel.displayName = "FormLabel";

const FormControl = forwardRef<
	ElementRef<typeof Slot>,
	ComponentPropsWithoutRef<typeof Slot>
>( ( { ...props }, ref ) =>
{
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return (
		<Slot
			id={formItemId}
			ref={ref}
			aria-describedby={
				!error
					? `${ formDescriptionId }`
					: `${ formDescriptionId } ${ formMessageId }`
			}
			aria-invalid={!!error}
			{...props}
		/>
	);
} );

FormControl.displayName = "FormControl";

const FormDescription = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLParagraphElement>
>( ( { className, ...props }, ref ) =>
{
	const { formDescriptionId } = useFormField();

	return (
		<p
			id={formDescriptionId}
			ref={ref}
			className={merge( "text-sm text-muted-foreground", className )}
			{...props}
		/>
	);
} );

FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLParagraphElement>
>( ( { className, children, ...props }, ref ) =>
{
	const { error, formMessageId } = useFormField();
	const body = error ? String( error?.message ) : children;

	if ( !body )
	{
		return null;
	}

	return (
		<p
			id={formMessageId}
			ref={ref}
			className={merge(
				"text-sm font-extrabold text-destructive",
				className
			)}
			{...props}
		>
			{body}
		</p>
	);
} );

FormMessage.displayName = "FormMessage";

export {
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField
};