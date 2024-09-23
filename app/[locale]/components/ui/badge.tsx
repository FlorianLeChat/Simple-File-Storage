//
// Composant générique des badges.
//  Source : https://ui.shadcn.com/docs/components/badge
//
import "@valibot/i18n/fr";
import * as v from "valibot";
import { merge } from "@/utilities/tailwind";
import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useLocale, useTranslations } from "next-intl";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				// Variants de couleur personnalisés.
				//  Source : https://github.com/tailwindlabs/tailwindcss/discussions/11189
				shared: "border-transparent bg-yellow-700 hover:bg-yellow-900 text-primary-foreground dark:text-secondary-foreground",
				public: "border-transparent bg-green-700 hover:bg-green-900 text-primary-foreground dark:text-secondary-foreground",
				private:
					"border-transparent bg-red-700 hover:bg-red-900 text-primary-foreground dark:text-secondary-foreground",
				// Variants de couleur prédéfinis.
				default:
					"border-transparent bg-primary text-primary-foreground dark:text-secondary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	}
);

export interface BadgeProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge( { className, variant, ...props }: BadgeProps )
{
	v.setGlobalConfig( { lang: useLocale() } );

	const messages = useTranslations( "dashboard" );

	return (
		<div className={merge( badgeVariants( { variant } ), className )}>
			{messages( props.children )}
		</div>
	);
}

export { Badge, badgeVariants };