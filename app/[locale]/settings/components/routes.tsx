//
// Composant des routes vers les paramètres.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { Cookie } from "lucide-react";
import { routes } from "@/config/routes";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "../../components/ui/button";

export default function Routes()
{
	// Déclaration des variables d'état.
	const pathname = usePathname();
	const messages = useTranslations( "navigation" );

	// Affichage du rendu HTML du composant.
	return (
		<nav className="flex flex-col flex-wrap gap-2 sm:max-lg:flex-row lg:-mx-4 lg:w-1/5">
			{/* Listes des routes */}
			{routes.map( ( route ) => (
				<Link
					key={route.href}
					href={route.href}
					className={merge(
						buttonVariants( { variant: "ghost" } ),
						pathname === route.href
							? "bg-muted hover:bg-muted"
							: "hover:bg-transparent hover:underline",
						"h-auto min-h-[2.5rem] justify-start"
					)}
				>
					{route.icon}

					{messages( `${ route.id }_title` )}
				</Link>
			) )}

			{/* Gestion des cookies */}
			<Button
				type="button"
				variant="ghost"
				data-cc="show-preferencesModal"
				className="h-auto min-h-10 justify-start text-left"
			>
				<Cookie className="mr-2" />

				<span>
					{messages( "cookies_title" )}

					<small className="hidden lg:block">
						{messages.rich( "cookies_description", {
							u: ( chunks ) => <u>{chunks}</u>
						} )}
					</small>
				</span>
			</Button>
		</nav>
	);
}