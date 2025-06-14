//
// Composant générique des formulaires.
//  Source : https://ui.shadcn.com/docs/components/form
//
import "@valibot/i18n/fr";
import * as v from "valibot";
import { merge } from "@/utilities/tailwind";
import { useLocale } from "next-intl";
import { Controller,
	FormProvider,
	useFormContext,
	type FieldPath,
	type FieldValues,
	type ControllerProps } from "react-hook-form";
import { useId,
	useMemo,
	useContext,
	forwardRef,
	createContext,
	type ElementRef,
	type HTMLAttributes,
	type ComponentPropsWithoutRef } from "react";
import { Slot as SlotPrimitive, type Label as LabelPrimitive } from "radix-ui";

import { Label } from "./label";

const Form = FormProvider;

interface FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>
{
	name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
);

function FormField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>( { ...props }: ControllerProps<TFieldValues, TName> )
{
	const name = useMemo( () => ( { name: props.name } ), [ props.name ] );

	return (
		<FormFieldContext.Provider value={name}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
}

interface FormItemContextValue
{
	id: string;
}

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
	ElementRef<typeof SlotPrimitive.Slot>,
	ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>( ( { ...props }, ref ) =>
{
	const { error, formItemId, formDescriptionId, formMessageId }
		= useFormField();

	return (
		<SlotPrimitive.Slot
			ref={ref}
			id={formItemId}
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
			ref={ref}
			id={formDescriptionId}
			className={merge( "text-muted-foreground text-sm", className )}
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
	v.setGlobalConfig( { lang: useLocale() } );

	const { error, formMessageId } = useFormField();
	const body = error ? String( error?.type ) : children;

	if ( !body )
	{
		return null;
	}

	return (
		<p
			ref={ref}
			id={formMessageId}
			className={merge( "text-destructive text-sm font-medium", className )}
			{...props}
		>
			{error?.message}
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