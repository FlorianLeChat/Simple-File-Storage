//
// Composant des routes vers les paramètres.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { Cookie } from "lucide-react";
import { usePathname } from "next/navigation";

import { routes } from "../../components/navigation";
import { Button, buttonVariants } from "../../components/ui/button";

export default function Routes()
{
	// Déclaration des variables d'état.
	const pathname = usePathname();

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
					{route.title}
				</Link>
			) )}

			{/* Gestion des cookies */}
			<Button
				type="button"
				variant="ghost"
				data-cc="show-preferencesModal"
				className="h-auto min-h-[2.5rem] justify-start"
			>
				<Cookie className="mr-2" />

				<p className="text-left">
					Cookies
					<small className="hidden lg:block">
						Service fourni par <u>Cookie Consent</u>
					</small>
				</p>
			</Button>
		</nav>
	);
}