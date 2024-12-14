//
// Composant d'animation pour le texte.
//  Source : https://magicui.design/docs/components/fade-text
//

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

type FadeTextProps = {
	as: string;
	delay?: number;
	className?: string;
	direction?: "up" | "down" | "left" | "right";
	framerProps?: Variants;
	children: ReactNode;
};

export default function FadeText( {
	as,
	delay = 0,
	direction = "up",
	className,
	framerProps = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { type: "spring", delay } }
	},
	children
}: Readonly<FadeTextProps> )
{
	const MotionComponent = motion.create( as, {
		forwardMotionProps: true
	} ) as typeof motion.div;
	const directionOffset = useMemo( () =>
	{
		const map = { up: 10, down: -10, left: -10, right: 10 };
		return map[ direction ];
	}, [ direction ] );

	const axis = direction === "up" || direction === "down" ? "y" : "x";

	const FADE_ANIMATION_VARIANTS = useMemo( () =>
	{
		const { hidden, show, ...rest } = framerProps as {
			[name: string]: { [name: string]: number; opacity: number };
		};

		return {
			...rest,
			hidden: {
				...( hidden ?? {} ),
				opacity: hidden?.opacity ?? 0,
				[ axis ]: hidden?.[ axis ] ?? directionOffset
			},
			show: {
				...( show ?? {} ),
				opacity: show?.opacity ?? 1,
				[ axis ]: show?.[ axis ] ?? 0
			}
		};
	}, [ directionOffset, axis, framerProps ] );
	const [ reducedMotion, setReducedMotion ] = useState( false );

	useEffect( () =>
	{
		setReducedMotion(
			window.matchMedia( "(prefers-reduced-motion: reduce)" ).matches
		);
	}, [] );

	return (
		<MotionComponent
			className={className}
			initial={reducedMotion ? "visible" : "hidden"}
			animate="show"
			viewport={{ once: true }}
			variants={reducedMotion ? undefined : FADE_ANIMATION_VARIANTS}
		>
			{children}
		</MotionComponent>
	);
}