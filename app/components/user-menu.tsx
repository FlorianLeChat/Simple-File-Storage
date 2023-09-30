//
// Composant de navigation du profil utilisateur.
//
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
	// Affichage du rendu HTML du composant.
	return (
		<nav className="flex items-center space-x-4 sm:ml-auto">
			<DropdownMenu>
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
							Profil
							<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
						</DropdownMenuItem>

						<DropdownMenuItem>
							Paramètres
							<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Déconnexion du compte */}
					<DropdownMenuItem>
						Déconnexion
						<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}