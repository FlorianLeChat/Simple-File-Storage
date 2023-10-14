//
// Composant des actions disponibles pour une ligne d'un tableau de données.
//  Source : https://ui.shadcn.com/docs/components/data-table
//
import { merge } from "@/utilities/tailwind";
import { Trash,
	UserX,
	Globe,
	Share2,
	History,
	FolderLock,
	ArrowUpRight,
	ClipboardCopy,
	MoreHorizontal } from "lucide-react";

import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { buttonVariants } from "../../components/ui/button";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogDescription } from "../../components/ui/alert-dialog";
import { DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator } from "../../components/ui/dropdown-menu";

import FileHistory from "./file-history";
import ShareManager from "./share-manager";

export default function RowActions()
{
	// Affichage du rendu HTML du composant.
	return (
		<DropdownMenu>
			{/* Bouton d'ouverture du menu */}
			<DropdownMenuTrigger
				className={merge(
					buttonVariants( { variant: "ghost" } ),
					"h-8 w-8 p-0"
				)}
			>
				<span className="sr-only">Ouvrir le menu</span>

				<MoreHorizontal className="h-4 w-4" />
			</DropdownMenuTrigger>

			{/* Actions disponibles */}
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions sur le fichier</DropdownMenuLabel>

				{/* Restriction d'accès */}
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<Globe className="mr-2 h-4 w-4" />
							Rendre public
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Globe className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir rendre public ce
									fichier ?
								</span>
							</AlertDialogTitle>

							<AlertDialogDescription>
								En rendant ce fichier public, il sera accessible
								à tout le monde, même aux utilisateurs en dehors
								du site Internet.{" "}
								<strong>
									Les restrictions de partage seront
									réinitialisées et désactivées.
								</strong>
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction>Confirmer</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<FolderLock className="mr-2 h-4 w-4" />
							Rendre privé
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<FolderLock className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir rendre privé ce
									fichier ?
								</span>
							</AlertDialogTitle>

							<AlertDialogDescription>
								En rendant ce fichier privé, il ne sera plus
								accessible aux utilisateurs en dehors du site
								Internet, ni aux utilisateurs non autorisés via
								les options de partage.{" "}
								<strong>
									Le fichier peut encore être accessible si
									celui-ci a été mis en cache par un tiers.
								</strong>
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction>Confirmer</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Gestion des partages */}
				<Dialog>
					<DialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<Share2 className="mr-2 h-4 w-4" />
							Gérer les partages
						</DropdownMenuItem>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Share2 className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Partage du fichier
								</span>
							</DialogTitle>

							<DialogDescription>
								Copier et partager le lien d&lsquo;accès aux
								utilisateurs de votre choix.
							</DialogDescription>
						</DialogHeader>

						<ShareManager />
					</DialogContent>
				</Dialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<UserX className="mr-2 h-4 w-4" />
							Supprimer tous les partages
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<UserX className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir supprimer tous les
									partages du fichier ?
								</span>
							</AlertDialogTitle>

							<AlertDialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Elle supprimera tous les partages du fichier et
								rendra le fichier privé.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction>Confirmer</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenuSeparator />

				{/* Accès et suppression */}
				<a
					rel="noopener noreferrer"
					href="https://www.google.fr/"
					target="_blank"
				>
					<DropdownMenuItem>
						<ArrowUpRight className="mr-2 h-4 w-4" />
						Accéder à la ressource
					</DropdownMenuItem>
				</a>

				<DropdownMenuSeparator />

				<Dialog>
					<DialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
						>
							<History className="mr-2 h-4 w-4" />
							Voir les révisions
						</DropdownMenuItem>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<History className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Révisions disponibles
								</span>
							</DialogTitle>

							<DialogDescription>
								Accéder et restaurer une version antérieure du
								fichier.
							</DialogDescription>
						</DialogHeader>

						<FileHistory />
					</DialogContent>
				</Dialog>

				<DropdownMenuItem>
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier le lien d&lsquo;accès
				</DropdownMenuItem>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
							onSelect={( event ) => event.preventDefault()}
							className="text-red-600"
						>
							<Trash className="mr-2 h-4 w-4" />

							<strong>Supprimer définitivement</strong>
						</DropdownMenuItem>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								<Trash className="mr-2 inline h-5 w-5" />

								<span className="align-middle">
									Êtes-vous sûr de vouloir supprimer ce
									fichier ?
								</span>
							</AlertDialogTitle>

							<AlertDialogDescription>
								<strong>Cette action est irréversible.</strong>{" "}
								Elle supprimera définitivement le fichier de
								votre espace de stockage.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction>Confirmer</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}