//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useState } from "react";
import serverAction from "@/utilities/recaptcha";
import { Trash,
	Users,
	Loader2,
	UserCog,
	UserPlus,
	ClipboardCopy,
	ClipboardCheck } from "lucide-react";
import type { User } from "next-auth";
import { useSession } from "next-auth/react";
import type { TableMeta } from "@tanstack/react-table";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import { addSharedUser, updateSharedUser, deleteSharedUser } from "../actions";

export default function ShareManager( {
	file,
	states
}: {
	file: FileAttributes;
	states: TableMeta<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const fetcher = ( url: string ) => fetch( url ).then( ( res ) => res.json() ) as Promise<User[]>;

	// Déclaration des variables d'état.
	const session = useSession();
	const [ search, setSearch ] = useState( "" );
	const [ copied, setCopied ] = useState( false );
	const { data, error, isLoading } = useSWR<User[]>(
		search !== ""
			? `${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/search/${ search }`
			: null,
		fetcher
	);

	// Filtrage des résultats de la recherche.
	const result =
		data?.filter(
			( user ) => !file.shares.some( ( share ) => share.user.uuid === user.id )
		) ?? [];

	// Soumission de la requête d'ajout d'un partage.
	const submitAddition = async ( user: User ) =>
	{
		// Activation de l'état de chargement.
		states.setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", user.id ?? "" );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( addSharedUser, form );

		// Fin de l'état de chargement.
		states.setLoading( false );

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
			toast.success( "form.info.update_success", {
				description: "form.info.sharing_updated"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de mise à jour du partage.
	const submitUpdate = async ( share: ShareAttributes, value: string ) =>
	{
		// Activation de l'état de chargement.
		states.setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", share.user.uuid ?? "" );
		form.append( "status", value );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( updateSharedUser, form );

		// Fin de l'état de chargement.
		states.setLoading( false );

		if ( state )
		{
			// Mise à jour de l'état du fichier.
			share.status = value as "read" | "write";

			states.setFiles( [ ...states.files ] );

			// Envoi d'une notification de succès.
			toast.success( "form.info.update_success", {
				description: "form.info.sharing_updated"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Soumission de la requête de suppression d'un partage.
	const submitDeletion = async ( share: ShareAttributes ) =>
	{
		// Activation de l'état de chargement.
		states.setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "userId", share.user.uuid ?? "" );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const state = await serverAction( deleteSharedUser, form );

		// Fin de l'état de chargement.
		states.setLoading( false );

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
			toast.success( "form.info.delete_success", {
				description: "form.info.sharing_updated"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.delete_failed", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Affichage du rendu HTML du composant.
	return (
		<>
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
						setCopied( true );

						// Réinitialisation de l'état de copie.
						setTimeout( () => setCopied( false ), 1500 );

						// Copie du lien dans le presse-papiers.
						navigator.clipboard.writeText(
							new URL( file.path, window.location.href ).href
						);
					}}
				>
					{copied ? (
						<>
							<ClipboardCheck className="mr-2 h-4 w-4" />
							Copié
						</>
					) : (
						<>
							<ClipboardCopy className="mr-2 h-4 w-4" />
							Copier
						</>
					)}
				</Button>
			</div>

			{/* Séparateur horizontal */}
			<Separator />

			{/* Liste des utilisateurs partagés */}
			<section>
				<h4 className="text-sm font-medium">
					<Users className="mr-2 inline h-4 w-4 align-text-top" />
					Liste des utilisateurs en partage
				</h4>

				{file.shares.length === 0 ? (
					<p className="mt-4 text-sm text-muted-foreground">
						Aucun utilisateur n&lsquo;a accès à ce fichier.
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
									disabled={states.loading}
									defaultValue={share.status}
									onValueChange={( value ) => submitUpdate( share, value )}
								>
									<SelectTrigger className="ml-auto gap-1">
										<SelectValue />
									</SelectTrigger>

									<SelectContent className="gap-1">
										<SelectItem value="read">
											Lecture
										</SelectItem>

										<SelectItem value="write">
											Écriture
										</SelectItem>
									</SelectContent>
								</Select>

								<Button
									title="Supprimer définitivement"
									onClick={() => submitDeletion( share )}
									variant="destructive"
									disabled={states.loading}
								>
									{states.loading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash className="h-4 w-4" />
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
					<UserCog className="mr-2 inline h-4 w-4 align-text-top" />
					Ajouts de nouveaux utilisateurs en partage
				</h4>

				<Input
					type="text"
					value={search}
					onChange={( event ) => setSearch( event.target.value )}
					disabled={states.loading}
					maxLength={50}
					className="mt-3"
					spellCheck="false"
					placeholder="Rechercher..."
					autoComplete="off"
					autoCapitalize="off"
				/>

				<p className="mt-3 text-sm text-muted-foreground">
					<strong>{result.length}</strong> résultat(s) trouvé(s) dans
					la base de données.
				</p>

				{/* Message d'erreur de la recherche */}
				{error && !isLoading && (
					<p className="mt-4 text-sm font-bold text-destructive">
						Une erreur est survenue lors de la recherche. Veuillez
						réessayer.
					</p>
				)}

				{/* État de chargement des résultats */}
				{isLoading && (
					<p className="mt-4 text-sm text-muted-foreground">
						<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
						Chargement des résultats...
					</p>
				)}

				{/* Résultats de la recherche */}
				<ScrollArea>
					<ul className={result.length > 0 ? "mt-4" : ""}>
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
									disabled={states.loading}
									className="max-sm:w-full sm:ml-auto"
								>
									{states.loading ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<UserPlus className="mr-2 h-4 w-4" />
									)}
									Ajouter
								</Button>

								{/* Séparateur horizontal */}
								{index !== result.length - 1 && (
									<Separator className="mb-3 mt-1" />
								)}
							</li>
						) )}
					</ul>
				</ScrollArea>
			</section>
		</>
	);
}