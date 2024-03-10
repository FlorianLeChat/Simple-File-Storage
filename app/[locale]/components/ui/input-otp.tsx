//
// Composant générique des champs de saisie pour les codes de vérification.
//  Source : https://ui.shadcn.com/docs/components/input-otp
//

"use client";

import { Dot } from "lucide-react";
import { merge } from "@/utilities/tailwind";
import { OTPInput, SlotProps } from "input-otp";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const InputOTP = forwardRef<
	ElementRef<typeof OTPInput>,
	ComponentPropsWithoutRef<typeof OTPInput>
>( ( { className, ...props }, ref ) => (
	<OTPInput
		ref={ref}
		containerClassName={merge( "flex items-center gap-2", className )}
		{...props}
	/>
) );

InputOTP.displayName = "InputOTP";

const InputOTPGroup = forwardRef<
	ElementRef<"div">,
	ComponentPropsWithoutRef<"div">
>( ( { className, ...props }, ref ) => (
	<div
		ref={ref}
		className={merge( "flex items-center", className )}
		{...props}
	/>
) );

InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = forwardRef<
	ElementRef<"div">,
	SlotProps & ComponentPropsWithoutRef<"div">
>( ( { char, hasFakeCaret, isActive, className, ...props }, ref ) => (
	<div
		ref={ref}
		className={merge(
			"relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
			isActive && "z-10 ring-2 ring-ring ring-offset-background",
			className
		)}
		{...props}
	>
		{char}
		{hasFakeCaret && (
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
			</div>
		)}
	</div>
) );

InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = forwardRef<
	ElementRef<"div">,
	ComponentPropsWithoutRef<"div">
>( ( { ...props }, ref ) => (
	<div ref={ref} role="separator" {...props}>
		<Dot />
	</div>
) );

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };