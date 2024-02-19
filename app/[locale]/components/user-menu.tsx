//
// Composant de navigation du profil utilisateur.
//

"use client";

import Link from "next/link";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useRouter } from "next/navigation";
import type { Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import { BellRing, Check, Loader2 } from "lucide-react";
import { useEffect, useCallback, useState } from "react";

import serverAction from "@/utilities/recaptcha";
import { Dialog,
	DialogTitle,
	DialogClose,
	DialogHeader,
	DialogFooter,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "./ui/dialog";
import { signOutAccount } from "../authentication/actions";
import { updateReadState } from "../actions";
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

// Typage des notifications provenant de la base de données.
type Notification = Prisma.NotificationGetPayload<object>;

// Intervalle de vérification des notifications (en millisecondes).
const CHECK_INTERVAL = 10000;

// Nombre maximal de notifications à afficher.
const MAX_NOTIFICATIONS = 50;

export default function UserMenu( { session }: { session: Session } )
{
	// Déclaration des constantes.
	const admin = session.user.role === "admin";
	const fullName = session.user.name;
	const { email } = session.user;
	const shortName = ( fullName ?? email )?.slice( 0, 2 ).toUpperCase() ?? "SFS";

	// Déclaration des variables d'état.
	const router = useRouter();
	const [ open, setOpen ] = useState( false );
	const [ unread, setUnread ] = useState( 0 );
	const [ loading, setLoading ] = useState( false );
	const [ notifications, setNotifications ] = useState<Notification[]>( [] );

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

					case "a":
						// Accès à l'administration.
						router.push( "/administration" );
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

	// Récupération des notifications depuis l'API.
	const fetchNotifications = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Lancement de la requête HTTP.
		fetch( `${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/notifications` )
			.then( ( response ) => response.json() as Promise<Notification[]> )
			.then( ( data ) =>
			{
				setNotifications( ( existing ) =>
				{
					// Filtrage des notifications existantes.
					const filter = data.filter(
						( notification ) => !existing.some(
							( cache ) => cache.title === notification.title
						)
					);

					// Comptage du nombre de notifications non lues.
					setUnread( ( count ) => Math.min( data.length, count + filter.length ) );

					// Désactivation de l'état de chargement.
					setLoading( false );

					// Conversion de la date de création en objet et limitation
					//  à un nombre maximal de notifications.
					return data
						.map( ( notification ) =>
						{
							notification.createdAt = new Date(
								notification.createdAt
							);

							return notification;
						} )
						.slice( 0, MAX_NOTIFICATIONS );
				} );
			} );
	};

	// Vérification périodique des notifications.
	useEffect( () =>
	{
		// Création d'un minuteur toutes les X secondes.
		const timer = setInterval( fetchNotifications, CHECK_INTERVAL );

		// Exécution immédiate de la fonction pour récupérer les notifications.
		fetchNotifications();

		// Nettoyage du minuteur au démontage du composant.
		return () => clearInterval( timer );
	}, [] );

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
			{/* Notifications utilisateur */}
			<Dialog>
				<DialogTrigger
					className={buttonVariants( {
						variant: unread > 0 ? "secondary" : "ghost"
					} )}
					aria-controls="notifications"
				>
					{loading ? (
						<Loader2 className="inline h-5 w-5 animate-spin" />
					) : (
						<BellRing className="inline h-5 w-5" />
					)}

					{unread > 0 && (
						<p
							id="notifications"
							className="hidden md:ml-2 md:inline-block"
						>
							Nouvelles notifications
						</p>
					)}
				</DialogTrigger>

				<DialogContent className="h-fit max-h-full w-[380px] overflow-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<BellRing className="mr-2 inline h-5 w-5" />
							Notifications
						</DialogTitle>

						<DialogDescription>
							{unread === 0
								? "Vous n'avez aucune nouvelle notification."
								: `Vous avez ${ unread } nouvelle(s) notification(s).`}
						</DialogDescription>
					</DialogHeader>

					{unread > 0 && (
						<>
							<ul className="my-2 flex flex-col gap-4">
								{notifications.map( ( notification ) => (
									<li
										key={notification.title}
										className="grid grid-cols-[25px_1fr]"
									>
										<p className="h-2 w-2 translate-y-1 rounded-full bg-primary" />

										<div className="space-y-1">
											<h3 className="text-sm font-medium leading-none">
												{notification.title}
											</h3>

											<p className="text-sm text-muted-foreground">
												{notification.message}
											</p>

											<time
												dateTime={notification.createdAt.toISOString()}
												className="text-xs text-muted-foreground"
											>
												{new Intl.DateTimeFormat(
													undefined,
													{
														year: "numeric",
														month: "long",
														day: "numeric",
														hour: "numeric",
														minute: "numeric",
														second: "numeric"
													}
												).format(
													notification.createdAt
												)}
											</time>
										</div>
									</li>
								) )}
							</ul>

							<DialogFooter>
								<DialogClose asChild>
									<Button
										onClick={async () =>
										{
											// Activation de l'état de chargement.
											setLoading( true );

											// Envoi de la requête au serveur et
											//  traitement de la réponse.
											const state = ( await serverAction(
												updateReadState,
												new FormData()
											) ) as boolean;

											if ( state )
											{
												// Marquage de toutes les notifications
												//  comme lues.
												setUnread( 0 );

												// Suppression de toutes les notifications.
												setNotifications( [] );
											}

											// Fin de l'état de chargement.
											setLoading( false );

											// Envoi d'une notification.
											if ( state )
											{
												// Mise à jour réussie.
												toast.success(
													"form.info.action_success",
													{
														description:
															"form.info.notifications_read"
													}
												);
											}
											else
											{
												// Erreur dans la mise à jour.
												toast.error(
													"form.errors.file_deleted",
													{
														description:
															"form.errors.server_error"
													}
												);
											}
										}}
										disabled={loading}
										className="w-full"
									>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Veuillez patienter...
											</>
										) : (
											<>
												<Check className="mr-2 h-4 w-4" />
												Tout marquer comme lu
											</>
										)}
									</Button>
								</DialogClose>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Menu utilisateur */}
			<DropdownMenu open={open} onOpenChange={setOpen}>
				{/* Bouton d'apparition */}
				<DropdownMenuTrigger
					className={merge(
						buttonVariants( { variant: "ghost" } ),
						"h-8 w-8 rounded-full"
					)}
				>
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={session.user.image ?? ""}
							alt={fullName ?? ""}
						/>

						<AvatarFallback>{shortName}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-56" align="end" forceMount>
					{/* Informations utilisateur */}
					<DropdownMenuLabel className="font-normal">
						{fullName ? (
							<>
								<p className="truncate text-sm font-medium">
									{fullName}
								</p>

								<p className="truncate text-xs text-muted-foreground">
									{email}
								</p>
							</>
						) : (
							<p className="truncate text-sm font-medium">
								{email}
							</p>
						)}

						<p
							className={`text-xs font-extrabold ${
								admin ? "text-destructive" : "text-primary"
							}`}
						>
							{admin
								? "Compte administrateur"
								: "Compte utilisateur"}
						</p>
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

						{admin && (
							<Link href="/administration">
								<DropdownMenuItem>
									Administration
									<DropdownMenuShortcut>
										ALT/⌥ + A
									</DropdownMenuShortcut>
								</DropdownMenuItem>
							</Link>
						)}
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Déconnexion du compte */}
					<DropdownMenuItem
						onClick={() =>
						{
							serverAction( signOutAccount, new FormData() );
						}}
					>
						Déconnexion
						<DropdownMenuShortcut>ALT/⌥ + L</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
}