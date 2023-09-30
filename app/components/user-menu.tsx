//
// Composant de navigation du profil utilisateur.
//

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";

import { Button } from "./ui/button";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
	DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

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
						router.push( "/" );
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
		router.prefetch( "/" );
		router.prefetch( "/dashboard" );
		router.prefetch( "/settings" );

		// On supprime enfin l'écouteur d'événement au démontage du composant.
		return () => window.removeEventListener( "keydown", handleShortcuts );
	}, [ router, handleShortcuts ] );

	// Affichage du rendu HTML du composant.
	return (
		<nav className="flex items-center space-x-4 sm:ml-auto">
			<DropdownMenu open={open} onOpenChange={setOpen}>
				{/* Bouton d'apparition */}
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="relative h-8 w-8 rounded-full"
					>
						<Avatar className="h-8 w-8">
							<AvatarImage
								src="/avatars/01.png"
								alt="Florian4016"
							/>
							<AvatarFallback>FL</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-56" align="end" forceMount>
					{/* Informations utilisateur */}
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								Florian4016
							</p>

							<p className="text-xs leading-none text-muted-foreground">
								florian@gmail.com
							</p>
						</div>
					</DropdownMenuLabel>

					{/* Barre verticale de séparation */}
					<DropdownMenuSeparator />

					{/* Options disponibles */}
					<DropdownMenuGroup>
						<DropdownMenuItem>
							Tableau de bord
							<DropdownMenuShortcut>
								ALT/⌥ + D
							</DropdownMenuShortcut>
						</DropdownMenuItem>

						<DropdownMenuItem>
							Paramètres
							<DropdownMenuShortcut>
								ALT/⌥ + S
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Déconnexion du compte */}
					<DropdownMenuItem>
						Déconnexion
						<DropdownMenuShortcut>ALT/⌥ + L</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}