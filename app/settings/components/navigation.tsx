//
// Composant de navigation des paramètres.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { usePathname } from "next/navigation";
import { Cookie, User, KeyRound, Palette } from "lucide-react";
import { Button, buttonVariants } from "../../components/ui/button";

// Déclaration des routes de paramétrage.
const routes = [
	{
		title: (
			<>
				<User className="mr-2 inline" />
				Profil utilisateur
			</>
		),
		href: "/settings/profile"
	},
	{
		title: (
			<>
				<KeyRound className="mr-2 inline" />
				Compte utilisateur
			</>
		),
		href: "/settings/account"
	},
	{
		title: (
			<>
				<Palette className="mr-2 inline" />
				Apparence
			</>
		),
		href: "/settings/layout"
	}
];

export default function Navigation()
{
	// Déclaration des constantes.
	const pathname = usePathname();

	// Affichage du rendu HTML du composant.
	return (
		<nav className="-mx-4 flex space-x-2 lg:w-1/5 lg:flex-col lg:space-x-0 lg:space-y-1">
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
						"justify-start"
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
				className="justify-start"
			>
				<Cookie className="mr-2" />
				Cookies
			</Button>
		</nav>
	);
}