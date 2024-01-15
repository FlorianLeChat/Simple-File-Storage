//
// Composant de navigation des paramètres.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { Cookie } from "lucide-react";
import { usePathname } from "next/navigation";

import { routes } from "../../components/header";
import { Button, buttonVariants } from "../../components/ui/button";

export default function Navigation()
{
	// Déclaration des variables d'état.
	const pathname = usePathname();

	// Affichage du rendu HTML du composant.
	return (
		<nav className="flex flex-col md:-mx-4 md:flex-row md:space-x-2 lg:w-1/5 lg:flex-col lg:space-x-0 lg:space-y-1">
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

				<span className="text-left">
					Cookies
					<small className="hidden lg:block">
						Service fourni par <u>Cookie Consent</u>
					</small>
				</span>
			</Button>
		</nav>
	);
}