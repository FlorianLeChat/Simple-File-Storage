//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useState } from "react";
import serverAction from "@/utilities/server-action";
import { Trash,
	Users,
	Share2,
	Loader2,
	UserCog,
	UserPlus,
	ClipboardCopy,
	ClipboardCheck } from "lucide-react";
import type { User } from "next-auth";
import { useSession } from "next-auth/react";
import type { TableMeta } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { FileAttributes } from "@/interfaces/File";
import type { ShareAttributes } from "@/interfaces/Share";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { Avatar,
	AvatarImage,
	AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { addSharedUser } from "../actions/shared-user-add";
import { DropdownMenuItem } from "../../components/ui/dropdown-menu";
import { updateSharedUser } from "../actions/shared-user-update";
import { deleteSharedUser } from "../actions/shared-user-delete";

export default function ShareManager( {
	file,
	states,
	disabled
}: Readonly<{
	file: FileAttributes;
	states: TableMeta<FileAttributes>;
	disabled: boolean;
}> )
{
	// Déclaration des constantes.
	const fetcher = ( url: string ) => fetch( url ).then( ( res ) => res.json() ) as Promise<User[]>;

	// Déclaration des variables d'état.
	const session = useSession();
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals.share-manager" );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ search, setSearch ] = useState( "" );
	const [ loading, setLoading ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( false );
	const { data, error, isLoading } = useSWR<User[]>(
		search !== "" ? `/api/user/search/${ search }` : null,
		fetcher
	);

	// Filtrage des résultats de la recherche.
	const result = data?.filter( ( user ) => !file.shares.some( ( share ) => share.user.uuid === user.id ) ) ?? [];

	// Soumission de la requête d'ajout d'un partage.
	const submitAddition = async ( user: User ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", user.id ?? "" );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( addSharedUser, {}, form );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state )
		{
			// Réinitialisation de la recherche.
			setSearch( "" );

			// Mise à jour de l'état du fichier.
			file.status = "shared";
			file.shares.push( {
				user: {
					uuid: user.id,
					name: user.name,
					email: user.email,
					image: user.image
				},
				status: "read"
			} );

			states.setFiles( [ ...states.files ] );

			// Envoi d'une notification de succès.
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.sharing_updated" )
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

	// Soumission de la requête de mise à jour du partage.
	const submitUpdate = async ( share: ShareAttributes, value: string ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", share.user.uuid ?? "" );
		form.append( "status", value );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( updateSharedUser, {}, form );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state )
		{
			// Mise à jour de l'état du fichier.
			share.status = value as "read" | "write";

			states.setFiles( [ ...states.files ] );

			// Envoi d'une notification de succès.
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.sharing_updated" )
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

	// Soumission de la requête de suppression d'un partage.
	const submitDeletion = async ( share: ShareAttributes ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", share.user.uuid ?? "" );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( deleteSharedUser, {}, form );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state )
		{
			// Réinitialisation de la recherche.
			setSearch( "" );

			// Mise à jour de l'état du fichier.
			if ( file.shares.length === 1 )
			{
				file.status = "private";
				file.shares = [];
			}
			else
			{
				file.shares = file.shares.filter(
					( value ) => value.user.uuid !== share.user.uuid
				);
			}

			if ( file.owner.id === session.data?.user.id )
			{
				states.setFiles( [ ...states.files ] );
			}
			else
			{
				states.setFiles( [
					...states.files.filter( ( value ) => value.uuid !== file.uuid )
				] );
			}

			// Envoi d'une notification de succès.
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.sharing_updated" )
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

	// Affichage du rendu HTML du composant.
	return (
		<Dialog
			open={isOpen}
			onOpenChange={( state ) =>
			{
				if ( !loading )
				{
					setIsOpen( state );
				}
			}}
		>
			<DialogTrigger asChild>
				{/* Bouton de sélection */}
				<DropdownMenuItem
					// https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
					disabled={disabled}
					onSelect={( event ) => event.preventDefault()}
				>
					<Share2 className="mr-2 size-4" />
					{modalMessages( "trigger" )}
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[75%]">
				{/* En-tête de la fenêtre modale */}
				<DialogHeader>
					<DialogTitle>
						<Share2 className="mr-2 inline size-5 align-text-top" />
						{modalMessages( "title" )}
					</DialogTitle>

					<DialogDescription>
						{modalMessages( "description" )}
					</DialogDescription>
				</DialogHeader>

				{/* Lien de partage */}
				<div className="flex gap-2 max-sm:flex-col">
					<Input
						type="url"
						value={new URL( file.path, window.location.href ).href}
						readOnly
					/>

					<Button
						variant="secondary"
						onClick={() =>
						{
							// Déclaration de la copie du lien.
							setIsCopied( true );

							// Réinitialisation de l'état de copie.
							setTimeout( () => setIsCopied( false ), 1500 );

							// Copie du lien dans le presse-papiers.
							navigator.clipboard.writeText(
								new URL( file.path, window.location.href ).href
							);
						}}
					>
						{isCopied ? (
							<>
								<ClipboardCheck className="mr-2 size-4" />
								{modalMessages( "copied" )}
							</>
						) : (
							<>
								<ClipboardCopy className="mr-2 size-4" />
								{modalMessages( "copy" )}
							</>
						)}
					</Button>
				</div>

				{/* Séparateur horizontal */}
				<Separator />

				{/* Liste des utilisateurs partagés */}
				<section>
					<h4 className="text-sm font-medium">
						<Users className="mr-2 inline size-4 align-text-top" />
						{modalMessages( "shared_users" )}
					</h4>

					{file.shares.length === 0 ? (
						<p className="mt-4 text-sm text-muted-foreground">
							{modalMessages( "empty" )}
						</p>
					) : (
						file.shares.map( ( share ) => (
							<article
								key={share.user.uuid}
								className="mt-4 flex flex-wrap items-center gap-3"
							>
								{/* Avatar de l'utilisateur */}
								<Avatar>
									<AvatarImage
										src={share.user.image ?? ""}
										alt={share.user.name ?? ""}
									/>

									<AvatarFallback>
										{( share.user.name ?? share.user.email )
											?.slice( 0, 2 )
											.toUpperCase() ?? "SFS"}
									</AvatarFallback>
								</Avatar>

								{/* Informations de l'utilisateur */}
								{share.user.name ? (
									<div className="max-w-60 text-sm">
										<p className="truncate">
											{share.user.name}
										</p>

										<p className="truncate text-muted-foreground">
											{share.user.email}
										</p>
									</div>
								) : (
									<p className="max-w-60 truncate text-sm">
										{share.user.email}
									</p>
								)}

								{/* Autorisations accordées */}
								<div className="flex gap-3 max-sm:w-full sm:ml-auto">
									<Select
										disabled={loading}
										defaultValue={share.status}
										onValueChange={( value ) => submitUpdate( share, value )}
									>
										<SelectTrigger className="ml-auto gap-1">
											<SelectValue />
										</SelectTrigger>

										<SelectContent className="gap-1">
											<SelectItem value="read">
												{modalMessages( "read" )}
											</SelectItem>

											<SelectItem value="write">
												{modalMessages( "write" )}
											</SelectItem>
										</SelectContent>
									</Select>

									<Button
										title={modalMessages( "delete" )}
										onClick={() => submitDeletion( share )}
										variant="destructive"
										disabled={loading}
										aria-label={modalMessages( "delete" )}
									>
										{loading ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash className="size-4" />
										)}
									</Button>
								</div>
							</article>
						) )
					)}
				</section>

				{/* Séparateur horizontal */}
				<Separator />

				{/* Ajout de nouveaux utilisateurs */}
				<section>
					<h4 className="text-sm font-medium">
						<UserCog className="mr-2 inline size-4 align-text-top" />
						{modalMessages( "user_list" )}
					</h4>

					<Input
						name="search"
						value={search}
						onChange={( event ) => setSearch( event.target.value )}
						disabled={loading}
						maxLength={50}
						className="mt-3"
						spellCheck="false"
						placeholder={modalMessages( "search" )}
						autoComplete="off"
						autoCapitalize="off"
					/>

					<p className="mt-3 text-sm text-muted-foreground">
						<strong>{result.length}</strong>{" "}
						{modalMessages( "fetch_result" )}
					</p>

					{/* Message d'erreur de la recherche */}
					{error && !isLoading && (
						<p className="mt-4 text-sm font-bold text-destructive">
							{modalMessages( "fetch_error" )}
						</p>
					)}

					{/* État de chargement des résultats */}
					{isLoading && (
						<p className="mt-4 text-sm text-muted-foreground">
							<Loader2 className="mr-2 inline size-4 animate-spin" />
							{modalMessages( "fetch_loading" )}
						</p>
					)}

					{/* Résultats de la recherche */}
					<ul
						className={
							result.length > 0
								? "mt-4 rounded-md border p-4"
								: ""
						}
					>
						{result.map( ( user, index ) => (
							<li
								key={user.id}
								className="flex flex-wrap items-center gap-3"
							>
								{/* Avatar de l'utilisateur */}
								<Avatar>
									<AvatarImage
										src={user.image ?? ""}
										alt={user.name ?? ""}
									/>

									<AvatarFallback>
										{( user.name ?? user.email )
											?.slice( 0, 2 )
											.toUpperCase() ?? "SFS"}
									</AvatarFallback>
								</Avatar>

								{/* Informations de l'utilisateur */}
								<p className="text-sm">
									{user.name}

									<span className="block text-muted-foreground">
										{user.email}
									</span>
								</p>

								{/* Bouton d'ajout de l'utilisateur */}
								<Button
									onClick={() =>
									{
										submitAddition( user );
									}}
									disabled={loading}
									className="max-sm:w-full sm:ml-auto"
								>
									{loading ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<UserPlus className="mr-2 size-4" />
									)}
									{modalMessages( "add" )}
								</Button>

								{/* Séparateur horizontal */}
								{index !== result.length - 1 && (
									<Separator className="mb-3 mt-1" />
								)}
							</li>
						) )}
					</ul>
				</section>
			</DialogContent>
		</Dialog>
	);
}