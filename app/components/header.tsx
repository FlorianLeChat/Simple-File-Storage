//
// Composant de navigation de l'en-tête.
//

"use client";

import Link from "next/link";
import { NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuContent,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle } from "./ui/navigation-menu";

// Déclaration des routes de paramétrage.
const routes: { title: string; href: string; description: string }[] = [
	{
		title: "Profil utilisateur",
		href: "/settings/profile",
		description: "Gestion des informations de votre profil utilisateur."
	},
	{
		title: "Compte utilisateur",
		href: "/settings/account",
		description:
			"Modification des informations de votre compte utilisateur."
	},
	{
		title: "Apparence",
		href: "/settings/layout",
		description: "Personnalisation de l'apparence du site Internet."
	},
	{
		title: "Signalement d'un bogue",
		href: "/settings/issue",
		description: "Signalement d'un bogue rencontré sur le site Internet."
	}
];

export default function Header()
{
	// Affichage du rendu HTML du composant.
	return (
		<NavigationMenu>
			<NavigationMenuList>
				{/* Page d'accueil */}
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link
							href="/dashboard"
							className={navigationMenuTriggerStyle()}
						>
							Tableau de bord
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>

				{/* Paramètres */}
				<NavigationMenuItem>
					<NavigationMenuTrigger
						id="settings"
						aria-controls="settings"
					>
						Paramètres
					</NavigationMenuTrigger>

					<NavigationMenuContent>
						<ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
							{routes.map( ( route ) => (
								<li key={route.href}>
									<NavigationMenuLink asChild>
										<Link
											href={route.href}
											title={route.title}
											className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
										>
											<h4 className="text-sm font-medium leading-none">
												{route.title}
											</h4>

											<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
												{route.description}
											</p>
										</Link>
									</NavigationMenuLink>
								</li>
							) )}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}