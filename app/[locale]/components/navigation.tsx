//
// Composant de navigation dans l'en-tête du site.
//

"use client";

import Link from "next/link";
import Image from "next/image";
import { Bug,
	Bell,
	User,
	Cctv,
	Files,
	Palette,
	Settings,
	LayoutDashboard } from "lucide-react";

import GitHubDark from "@/public/assets/images/github-dark.png";
import GitHubLight from "@/public/assets/images/github-light.png";
import { NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuContent,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle } from "./ui/navigation-menu";

// Déclaration des routes de paramétrage.
export const routes: {
	title: JSX.Element;
	href: string;
	description: string;
}[] = [
	{
		title: (
			<>
				<User className="mr-2 inline" />
				Utilisateur
			</>
		),
		href: "/settings/user",
		description:
			"Gestion des informations de votre profil et de votre compte."
	},
	{
		title: (
			<>
				<Files className="mr-2 inline" />
				Stockage
			</>
		),
		href: "/settings/storage",
		description:
			"Personnalisation du mécanisme de téléversement des fichiers."
	},
	{
		title: (
			<>
				<Palette className="mr-2 inline" />
				Apparence
			</>
		),
		href: "/settings/layout",
		description: "Personnalisation de l'apparence du site Internet."
	},
	{
		title: (
			<>
				<Bell className="mr-2 inline" />
				Notifications
			</>
		),
		href: "/settings/notifications",
		description:
			"Gestion des notifications reçues par courriel ou sur le site Internet."
	},
	{
		title: (
			<>
				<Bug className="mr-2 inline" />
				Bogues
			</>
		),
		href: "/settings/issue",
		description: "Signalement d'un bogue rencontré sur le site Internet."
	},
	{
		title: (
			<>
				<Cctv className="mr-2 inline" />
				Confidentialité
			</>
		),
		href: "/settings/privacy",
		description:
			"Gestion des données personnelles collectées par le site Internet."
	}
];

export default function Header( {
	theme,
	source
}: {
	theme: string;
	source: string;
} )
{
	// Affichage du rendu HTML du composant.
	return (
		<NavigationMenu className="flex items-center max-md:flex-col">
			<NavigationMenuList>
				{/* Page d'accueil */}
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link
							href="/dashboard"
							className={navigationMenuTriggerStyle()}
						>
							<LayoutDashboard className="h-5 w-5 md:hidden" />
							<p className="hidden md:inline">Tableau de bord</p>
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>

				{/* Paramètres */}
				<NavigationMenuItem>
					<NavigationMenuTrigger
						id="settings"
						aria-controls="settings"
					>
						<Settings className="h-5 w-5 md:hidden" />
						<p className="hidden md:inline">Paramètres</p>
					</NavigationMenuTrigger>

					<NavigationMenuContent>
						<ul className="grid w-[250px] gap-3 p-4 sm:w-[400px] lg:w-[800px] lg:grid-cols-[.75fr_1fr_1fr]">
							{/* Image d'illustration */}
							<li className="row-span-3 max-lg:hidden">
								<NavigationMenuLink
									rel="noopener noreferrer"
									href={`${ source }/issues`}
									target="_blank"
									className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
								>
									<Image
										src={
											theme === "dark"
												? GitHubLight
												: GitHubDark
										}
										alt="GitHub"
										className="w-[100px] self-center rounded-md object-cover"
									/>

									<h1 className="mb-2 mt-4 text-lg font-medium">
										Autre chose ?
									</h1>

									<p className="text-sm leading-tight text-muted-foreground">
										Si les paramètres proposés ne
										correspondent pas à vos besoins,
										n&lsquo;hésitez pas à{" "}
										<u>faire une demande</u> sur GitHub !
									</p>
								</NavigationMenuLink>
							</li>

							{/* Liens de navigation */}
							{routes.map( ( route ) => (
								<li key={route.href}>
									<NavigationMenuLink asChild>
										<Link
											href={route.href}
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