//
// Composant de navigation dans l'en-tête du site.
//

"use client";

import Link from "next/link";
import Image from "next/image";
import { routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Settings, LayoutDashboard } from "lucide-react";

import GitHubDark from "@/public/assets/images/github-dark.png";
import GitHubLight from "@/public/assets/images/github-light.png";

import BlurIn from "./ui/thirdparty/blur-in";
import { NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuContent,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle } from "./ui/navigation-menu";

export default function Navigation( {
	theme,
	source
}: Readonly<{
	theme: string;
	source: string;
}> )
{
	// Déclaration des variables d'état.
	const headerMessages = useTranslations( "header" );
	const navigationMessages = useTranslations( "navigation" );
	const [ image, setImage ] = useState(
		theme === "dark" ? GitHubLight : GitHubDark
	);

	// Détection du thème préféré par l'utilisateur.
	//  Note : cette détection est nécessaire pour le cas où l'utilisateur
	//   n'a pas de préférence enregistrée dans son compte.
	useEffect( () =>
	{
		if ( document.documentElement.classList.contains( "dark" ) )
		{
			setImage( GitHubLight );
		}
	}, [ theme ] );

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
							<BlurIn
								as="div"
								duration={0.4}
								className="text-black dark:text-white"
							>
								<LayoutDashboard className="size-5 md:hidden" />
							</BlurIn>

							<BlurIn
								as="span"
								duration={0.4}
								className="hidden text-black dark:text-white md:inline"
							>
								{headerMessages( "dashboard" )}
							</BlurIn>
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>

				{/* Paramètres */}
				<NavigationMenuItem>
					<NavigationMenuTrigger
						id="settings"
						aria-controls="settings"
					>
						<BlurIn
							as="div"
							duration={0.4}
							className="text-black dark:text-white"
						>
							<Settings className="size-5 md:hidden" />
						</BlurIn>

						<BlurIn
							as="span"
							duration={0.4}
							className="hidden text-black dark:text-white md:inline"
						>
							{headerMessages( "settings" )}
						</BlurIn>
					</NavigationMenuTrigger>

					<NavigationMenuContent>
						<ul className="grid w-[250px] gap-3 p-4 sm:w-[400px] lg:w-[800px] lg:grid-cols-[.75fr_1fr_1fr]">
							{/* Image d'illustration */}
							<li className="row-span-3 max-lg:hidden">
								<NavigationMenuLink
									rel="noopener noreferrer"
									href={`${ source }/issues`}
									target="_blank"
									className="flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
								>
									<Image
										src={image}
										alt="GitHub"
										className="w-[100px] self-center rounded-md object-cover"
									/>

									<h1 className="mb-2 mt-4 text-lg font-medium">
										{headerMessages( "something_else" )}
									</h1>

									<p className="text-sm leading-tight text-muted-foreground">
										{headerMessages.rich( "github_tip", {
											u: ( chunks ) => <u>{chunks}</u>
										} )}
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
												{route.icon}

												{navigationMessages(
													`${ route.id }_title`
												)}
											</h4>

											<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
												{navigationMessages(
													`${ route.id }_description`
												)}
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