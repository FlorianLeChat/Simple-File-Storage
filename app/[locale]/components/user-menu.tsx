//
// Composant de navigation du profil utilisateur.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { useRouter } from "next/navigation";
import { BellRing, Check } from "lucide-react";
import { useEffect, useCallback, useState } from "react";

import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "./ui/dialog";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
	DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Button, buttonVariants } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const notifications = [
	{
		type: "success",
		title: "Nouveau fichier téléversé",
		description: "Votre fichier a bien été téléversé."
	},
	{
		type: "warning",
		title: "Collaborateur supprimé",
		description: "Donald a été supprimé de votre espace de travail."
	},
	{
		type: "error",
		title: "Espace de stockage saturé",
		description: "Vous avez atteint 90% de votre espace de stockage."
	}
];

export default function UserMenu()
{
	// Déclaration des constantes.
	const router = useRouter();

	// Déclaration des variables d'état.
	const [ open, setOpen ] = useState( false );

	// Capture et support des combinaisons de touches.
	const handleShortcuts = useCallback(
		( event: KeyboardEvent ) =>
		{
			// On vérifie que la touche ALT est pressée.
			if ( event.altKey )
			{
				// On vérifie enfin la touche pressée.
				event.preventDefault();

				switch ( event.key )
				{
					case "m":
						// Ouverture/fermeture du menu.
						setOpen( ( state ) => !state );
						break;

					case "d":
						// Accès au tableau de bord.
						router.push( "/dashboard" );
						break;

					case "s":
						// Accès aux paramètres.
						router.push( "/settings" );
						break;

					case "l":
						// Accès à la page d'authentification.
						router.push( "/authentication" );
						break;

					default:
						break;
				}
			}
		},
		[ router ]
	);

	// Récupération des touches pressées.
	useEffect( () =>
	{
		// On ajoute un écouteur d'événement pour chaque touche pressée
		//  au montage du composant.
		window.addEventListener( "keydown", handleShortcuts );

		// On précharge ensuite les trois routes concernées pour éviter
		//  un temps de chargement trop long.
		router.prefetch( "/dashboard" );
		router.prefetch( "/settings" );
		router.prefetch( "/authentication" );

		// On supprime enfin l'écouteur d'événement au démontage du composant.
		return () => window.removeEventListener( "keydown", handleShortcuts );
	}, [ router, handleShortcuts ] );

	// Affichage du rendu HTML du composant.
	return (
		<nav className="flex items-center justify-center space-x-4 md:ml-auto">
			<Dialog>
				<DialogTrigger
					className={buttonVariants( { variant: "secondary" } )}
				>
					<BellRing className="inline h-5 w-5 md:mr-2" />

					<span className="hidden md:inline">
						Nouvelles notifications
					</span>
				</DialogTrigger>

				<DialogContent className="w-[380px]">
					<DialogHeader>
						<DialogTitle>
							<BellRing className="mr-2 inline h-5 w-5" />
							Notifications
						</DialogTitle>

						<DialogDescription>
							Vous avez 3 nouvelles notifications.
						</DialogDescription>
					</DialogHeader>

					<ul className="my-2 flex flex-col gap-4">
						{notifications.map( ( notification ) => (
							<li
								key={notification.title}
								className="grid grid-cols-[25px_1fr]"
							>
								<span className="h-2 w-2 translate-y-1 rounded-full bg-primary" />

								<div className="space-y-1">
									<p className="text-sm font-medium leading-none">
										{notification.title}
									</p>

									<p className="text-sm text-muted-foreground">
										{notification.description}
									</p>
								</div>
							</li>
						) )}
					</ul>

					<DialogFooter>
						<Button className="w-full">
							<Check className="mr-2 h-4 w-4" />
							Tout marquer comme lu
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DropdownMenu open={open} onOpenChange={setOpen}>
				{/* Bouton d'apparition */}
				<DropdownMenuTrigger
					className={merge(
						buttonVariants( { variant: "ghost" } ),
						"h-8 w-8 rounded-full"
					)}
				>
					<Avatar className="h-8 w-8">
						<AvatarImage src="/avatars/01.png" alt="Florian4016" />
						<AvatarFallback>FL</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-56" align="end" forceMount>
					{/* Informations utilisateur */}
					<DropdownMenuLabel className="font-normal">
						<span className="block text-sm font-medium leading-none">
							Florian4016
						</span>

						<span className="mt-1 text-xs leading-none text-muted-foreground">
							florian@gmail.com
						</span>
					</DropdownMenuLabel>

					{/* Barre verticale de séparation */}
					<DropdownMenuSeparator />

					{/* Options disponibles */}
					<DropdownMenuGroup>
						<Link href="/dashboard">
							<DropdownMenuItem>
								Tableau de bord
								<DropdownMenuShortcut>
									ALT/⌥ + D
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						</Link>

						<Link href="/settings">
							<DropdownMenuItem>
								Paramètres
								<DropdownMenuShortcut>
									ALT/⌥ + S
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Déconnexion du compte */}
					<Link href="/authentication">
						<DropdownMenuItem>
							Déconnexion
							<DropdownMenuShortcut>
								ALT/⌥ + L
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}