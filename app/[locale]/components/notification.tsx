//
// Composant des notifications dans l'en-tête du site.
//

"use client";

import { toast } from "sonner";
import serverAction from "@/utilities/server-action";
import { useRouter } from "next/navigation";
import { BellRing, Check, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useCallback, useState } from "react";

import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "./ui/dialog";
import { updateReadState } from "../actions";
import { Button, buttonVariants } from "./ui/button";

// Typage des notifications provenant de la base de données.
interface Notification
{
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
	const locale = useLocale();
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals.notifications" );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ unreadCount, setUnreadCount ] = useState( 0 );
	const [ notifications, setNotifications ] = useState<Notification[]>( [] );

	// Récupération des notifications depuis l'API.
	const fetchNotifications = useCallback( async () =>
	{
		// Activation de l'état de chargement.
		setIsLoading( true );

		// Lancement de la requête HTTP et vérification de la réponse.
		const response = await fetch( "/api/user/notifications" );

		if ( !response.ok )
		{
			return;
		}

		// Récupération des données et conversion en tableau de notifications.
		const data = ( await response.json() ) as Notification[];

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
			setIsLoading( false );

			// Vérification de l'existence de l'API de notifications.
			if ( typeof Notification !== "undefined" && filter.length > 0 )
			{
				// Demande de permission pour les notifications.
				const icon: HTMLLinkElement | null = document.querySelector(
					"link[sizes = \"512x512\"]"
				);

				Notification.requestPermission().then( ( permission ) =>
				{
					// Création d'une notification si la permission est accordée.
					if ( permission === "granted" )
					{
						data.forEach( ( notification ) =>
						{
							const popup = new Notification(
								"Simple File Storage",
								{
									icon: icon?.href,
									body: modalMessages(
										`description_${ notification.title }`
									)
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
					notification.createdAt = new Date( notification.createdAt );

					return notification;
				} )
				.slice( 0, MAX_NOTIFICATIONS );
		} );
	}, [ modalMessages, router ] );

	// Soumission de la requête de marquage de toutes les notifications comme lues.
	const submitClearing = async () =>
	{
		// Activation de l'état de chargement.
		setIsLoading( true );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const state = await serverAction( updateReadState, {}, new FormData() );

		// Fin de l'état de chargement.
		setIsLoading( false );

		if ( state )
		{
			// Fermeture de la boîte de dialogue.
			setIsOpen( false );

			// Marquage de toutes les notifications
			//  comme lues.
			setUnreadCount( 0 );

			// Suppression de toutes les notifications.
			setNotifications( [] );

			// Récupération des notifications mises à jour.
			fetchNotifications();

			// Envoi d'une notification de succès.
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.notifications_read" )
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
		<Dialog
			open={isOpen}
			onOpenChange={( state ) =>
			{
				if ( !isLoading )
				{
					setIsOpen( state );
				}
			}}
		>
			<DialogTrigger
				className={buttonVariants( {
					variant: unreadCount > 0 ? "secondary" : "ghost"
				} )}
			>
				{isLoading ? (
					<Loader2 className="inline size-5 animate-spin" />
				) : (
					<BellRing className="inline size-5" />
				)}

				{unreadCount > 0 && (
					<span
						id="notifications"
						className="hidden md:ml-2 md:inline-block"
					>
						{modalMessages( "trigger" )}
					</span>
				)}
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<BellRing className="mr-2 inline size-5" />
						{modalMessages( "title" )}
					</DialogTitle>

					<DialogDescription className="text-left">
						{unreadCount === 0
							? modalMessages( "empty" )
							: modalMessages( "description", {
								count: unreadCount
							} )}
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
									<span className="size-2 translate-y-1 rounded-full bg-primary" />

									<section className="space-y-1">
										<h3 className="text-sm font-medium leading-none">
											{modalMessages(
												`title_${ notification.title }`
											)}
										</h3>

										<p className="text-sm text-muted-foreground">
											{modalMessages(
												`description_${ notification.message }`
											)}
										</p>

										<time
											dateTime={notification.createdAt.toISOString()}
											className="text-xs text-muted-foreground"
											suppressHydrationWarning
										>
											{new Intl.DateTimeFormat( locale, {
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric"
											} ).format( notification.createdAt )}
										</time>
									</section>
								</li>
							) )}
						</ul>

						<Button
							onClick={submitClearing}
							disabled={isLoading}
							className="w-full"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									{formMessages( "loading" )}
								</>
							) : (
								<>
									<Check className="mr-2 size-4" />
									{modalMessages( "read_all" )}
								</>
							)}
						</Button>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}