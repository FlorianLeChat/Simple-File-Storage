//
// Composant de navigation des paramètres.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../../components/ui/button";

export default function Navigation( {
	routes
}: {
	routes: { href: string; title: string }[];
} )
{
	// Déclaration des constantes.
	const pathname = usePathname();

	// Affichage du rendu HTML du composant.
	return (
		<nav className="-mx-4 flex space-x-2 lg:w-1/5 lg:flex-col lg:space-x-0 lg:space-y-1">
			{routes.map( ( route ) => (
				<Link
					key={route.href}
					href={route.href}
					className={merge(
						buttonVariants( { variant: "ghost" } ),
						pathname === route.href
							? "bg-muted hover:bg-muted"
							: "hover:bg-transparent hover:underline",
						"justify-start"
					)}
				>
					{route.title}
				</Link>
			) )}
		</nav>
	);
}