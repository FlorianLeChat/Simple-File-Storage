//
// Composant des notifications dans l'en-tête du site.
//

"use client";

import { toast } from "sonner";
import serverAction from "@/utilities/recaptcha";
import { useRouter } from "next/navigation";
import { BellRing, Check, Loader2 } from "lucide-react";
import { useEffect, useCallback, useState } from "react";

import { Dialog,
	DialogTitle,
	DialogClose,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "./ui/dialog";
import { buttonVariants } from "./ui/button";
import { updateReadState } from "../actions";

// Typage des notifications provenant de la base de données.
type Notification = {
	title: string;
	message: string;
	createdAt: Date;
};

// Intervalle de vérification des notifications (en millisecondes).
const CHECK_INTERVAL = 10000;

// Nombre maximal de notifications à afficher.
const MAX_NOTIFICATIONS = 50;

export default function Notifications()
{
	// Déclaration des variables d'état.
	const router = useRouter();
	const [ isLoading, setLoading ] = useState( false );
	const [ unreadCount, setUnreadCount ] = useState( 0 );
	const [ notifications, setNotifications ] = useState<Notification[]>( [] );

	// Récupération des notifications depuis l'API.
	const fetchNotifications = useCallback( async () =>
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
					setUnreadCount( ( count ) => Math.min( data.length, count + filter.length ) );

					// Désactivation de l'état de chargement.
					setLoading( false );

					// Vérification de l'existence de l'API de notifications.
					if ( typeof Notification !== "undefined" )
					{
						// Demande de permission pour les notifications.
						const icon: HTMLLinkElement | null =
							document.querySelector( "link[sizes = \"512x512\"]" );

						Notification.requestPermission().then( ( permission ) =>
						{
							// Création d'une notification si la permission est accordée.
							if ( permission === "granted" )
							{
								data.forEach( ( notification ) =>
								{
									const popup = new Notification(
										document.title,
										{
											icon: icon?.href,
											body: notification.title,
											timestamp:
												notification.createdAt.getTime()
										}
									);

									popup.addEventListener( "click", () =>
									{
										// Redirection vers les paramètres de notifications.
										router.push( "/settings/notifications" );
									} );
								} );
							}
						} );
					}

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
	}, [ router ] );

	// Soumission de la requête de marquage de toutes les notifications comme lues.
	const submitClearing = async () =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const state = await serverAction( updateReadState, new FormData() );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state )
		{
			// Marquage de toutes les notifications
			//  comme lues.
			setUnreadCount( 0 );

			// Suppression de toutes les notifications.
			setNotifications( [] );

			// Envoi d'une notification de succès.
			toast.success( "form.info.action_success", {
				description: "form.info.notifications_read"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
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
	}, [ fetchNotifications ] );

	// Affichage du rendu HTML du composant.
	return (
		<Dialog>
			<DialogTrigger
				className={buttonVariants( {
					variant: unreadCount > 0 ? "secondary" : "ghost"
				} )}
				aria-controls="notifications"
			>
				{isLoading ? (
					<Loader2 className="inline h-5 w-5 animate-spin" />
				) : (
					<BellRing className="inline h-5 w-5" />
				)}

				{unreadCount > 0 && (
					<p
						id="notifications"
						className="hidden md:ml-2 md:inline-block"
					>
						Nouvelles notifications
					</p>
				)}
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:h-3/4">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<BellRing className="mr-2 inline h-5 w-5" />
						Notifications
					</DialogTitle>

					<DialogDescription className="text-left">
						{unreadCount === 0
							? "Vous n'avez aucune nouvelle notification."
							: `Vous avez ${ unreadCount } nouvelle(s) notification(s).`}
					</DialogDescription>
				</DialogHeader>

				{unreadCount > 0 && (
					<>
						<ul className="my-2 flex flex-col gap-4">
							{notifications.map( ( notification ) => (
								<li
									key={notification.title}
									className="grid grid-cols-[25px_1fr]"
								>
									<span className="h-2 w-2 translate-y-1 rounded-full bg-primary" />

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
											).format( notification.createdAt )}
										</time>
									</div>
								</li>
							) )}
						</ul>

						<DialogClose
							onClick={submitClearing}
							className={buttonVariants()}
						>
							{isLoading ? (
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
						</DialogClose>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}