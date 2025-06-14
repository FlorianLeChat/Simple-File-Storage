//
// Composant générique de l'avatar.
//  Source : https://ui.shadcn.com/docs/components/avatar
//
import { merge } from "@/utilities/tailwind";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

const Avatar = forwardRef<
	ElementRef<typeof AvatarPrimitive.Root>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>( ( { className, ...props }, ref ) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={merge(
			"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
			className
		)}
		{...props}
	/>
) );

Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = forwardRef<
	ElementRef<typeof AvatarPrimitive.Image>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>( ( { className, ...props }, ref ) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={merge( "aspect-square h-full w-full", className )}
		{...props}
	/>
) );

AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = forwardRef<
	ElementRef<typeof AvatarPrimitive.Fallback>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>( ( { className, ...props }, ref ) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={merge(
			"bg-muted flex h-full w-full items-center justify-center rounded-full",
			className
		)}
		{...props}
	/>
) );

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };