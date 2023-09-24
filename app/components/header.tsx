//
// Composant de navigation de l'en-tête.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { usePathname } from "next/navigation";

// Déclaration des routes de navigation.
const routes = [
	{
		title: "Tableau de bord",
		href: "/dashboard"
	},
	{
		title: "Paramètres",
		href: "/settings"
	}
];

export default function Header()
{
	// Déclaration des constantes.
	const pathname = usePathname();

	// Affichage du rendu HTML du composant.
	return (
		<nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
			{routes.map( ( route ) => (
				<Link
					key={route.href}
					href={route.href}
					className={merge(
						!pathname.startsWith( route.href ) && "text-muted-foreground",
						"text-sm font-medium transition-colors hover:text-primary"
					)}
				>
					{route.title}
				</Link>
			) )}
		</nav>
	);
}