//
// Composant d'animation pour le texte.
//  Source : https://magicui.design/docs/components/blur-in
//

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BlurInProps {
	as: string;
	children: ReactNode;
	className?: string;
	variant?: {
		hidden: { filter: string; opacity: number };
		visible: { filter: string; opacity: number };
	};
	delay?: number;
	duration?: number;
}

function BlurIn( {
	as,
	children,
	className,
	variant,
	delay = 0,
	duration = 1
}: Readonly<BlurInProps> )
{
	const MotionComponent = motion.create( as, {
		forwardMotionProps: true
	} ) as typeof motion.div;
	const defaultVariants = {
		hidden: { filter: "blur(10px)", opacity: 0 },
		visible: {
			filter: "blur(0px)",
			opacity: 1,
			transition: { delay, duration }
		}
	};
	const combinedVariants = variant || defaultVariants;

	return (
		<MotionComponent
			initial="hidden"
			animate="visible"
			variants={combinedVariants}
			className={className}
		>
			{children}
		</MotionComponent>
	);
}

export default BlurIn;