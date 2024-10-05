//
// Composant du menu utilisateur dans l'en-tête du site.
//

"use client";

import Link from "next/link";
import { merge } from "@/utilities/tailwind";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useCallback, useState } from "react";

import serverAction from "@/utilities/recaptcha";
import { buttonVariants } from "./ui/button";
import { signOutAccount } from "../authentication/actions/signout";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
	DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export default function UserMenu( { session }: { session: Session } )
{
	// Déclaration des variables d'état.
	const router = useRouter();
	const messages = useTranslations( "header" );
	const [ isOpen, setOpen ] = useState( false );

	// Déclaration des constantes.
	const { email } = session.user;
	const { name } = session.user;
	const fallback = ( name ?? email )?.slice( 0, 2 ).toUpperCase() ?? "SFS";
	const isAdmin = session.user.role === "admin";

	// Capture et support des combinaisons de touches.
	const handleShortcuts = useCallback(
		( event: KeyboardEvent ) =>
		{
			// On vérifie que la touche ALT est pressée.
			if ( event.altKey )
			{
				// On vérifie ensuite que l'utilisateur n'est pas en train
				//  de saisir du texte dans un champ de formulaire.
				if ( document.activeElement?.tagName === "INPUT" )
				{
					return;
				}

				// On vérifie enfin la touche pressée.
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
		<DropdownMenu open={isOpen} onOpenChange={setOpen} modal={false}>
			{/* Bouton d'apparition */}
			<DropdownMenuTrigger
				className={merge(
					buttonVariants( { variant: "ghost" } ),
					"h-8 w-8 rounded-full"
				)}
			>
				<Avatar className="size-8">
					<AvatarImage
						src={session.user.image ?? ""}
						alt={name ?? ""}
					/>

					<AvatarFallback>{fallback}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56" align="end" forceMount>
				{/* Informations utilisateur */}
				<DropdownMenuLabel className="font-normal">
					{name ? (
						<>
							<p className="truncate text-sm font-medium">
								{name}
							</p>

							<p className="truncate text-xs text-muted-foreground">
								{email}
							</p>
						</>
					) : (
						<p className="truncate text-sm font-medium">{email}</p>
					)}

					<p
						className={`text-xs font-extrabold ${
							isAdmin ? "text-destructive" : "text-primary"
						}`}
					>
						{isAdmin
							? messages( "admin_account" )
							: messages( "user_account" )}
					</p>
				</DropdownMenuLabel>

				{/* Barre verticale de séparation */}
				<DropdownMenuSeparator />

				{/* Options disponibles */}
				<DropdownMenuGroup>
					<Link href="/dashboard">
						<DropdownMenuItem>
							{messages( "dashboard" )}

							<DropdownMenuShortcut>
								ALT/⌥ + D
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>

					<Link href="/settings">
						<DropdownMenuItem>
							{messages( "settings" )}

							<DropdownMenuShortcut>
								ALT/⌥ + S
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				{/* Déconnexion du compte */}
				<DropdownMenuItem
					onClick={() =>
					{
						serverAction( signOutAccount, new FormData() );
					}}
				>
					{messages( "logout" )}
					<DropdownMenuShortcut>ALT/⌥ + L</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}