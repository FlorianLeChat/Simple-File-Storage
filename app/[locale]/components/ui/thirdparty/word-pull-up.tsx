//
// Composant d'animation pour le texte.
//  Source : https://magicui.design/docs/components/word-pull-up
//

"use client";

import { merge } from "@/utilities/tailwind";
import { motion, type Variants } from "framer-motion";

interface WordPullUpProps {
	as: string;
	words: string;
	delayMultiple?: number;
	wrapperFramerProps?: Variants;
	framerProps?: Variants;
	className?: string;
}

export default function WordPullUp( {
	as,
	words,
	wrapperFramerProps = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2
			}
		}
	},
	framerProps = {
		hidden: { y: 20, opacity: 0 },
		show: { y: 0, opacity: 1 }
	},
	className
}: Readonly<WordPullUpProps> )
{
	const MotionComponent = motion.create( as ) as typeof motion.div;

	return (
		<MotionComponent
			variants={wrapperFramerProps}
			initial="hidden"
			animate="show"
			className={merge(
				"font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
				className
			)}
		>
			{words.split( " " ).map( ( word ) => (
				<motion.span
					key={word}
					variants={framerProps}
					style={{ display: "inline-block", paddingRight: "8px" }}
				>
					{word === "" ? <span>&nbsp;</span> : word}
				</motion.span>
			) )}
		</MotionComponent>
	);
}