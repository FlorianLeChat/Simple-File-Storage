//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import useSWR from "swr";
import { useState } from "react";
import { Trash,
	Users,
	Loader2,
	UserCog,
	UserPlus,
	ClipboardCopy } from "lucide-react";
import type { User } from "next-auth";
import type { FileAttributes } from "@/interfaces/File";
import type { Table, Row, TableMeta } from "@tanstack/react-table";

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

export default function ShareManager( {
	table,
	row
}: {
	table: Table<FileAttributes>;
	row: Row<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const fetcher = ( url: string ) => fetch( url ).then( ( res ) => res.json() ) as Promise<User[]>;
	const states = table.options.meta as TableMeta<FileAttributes>;
	const file = states.files.filter( ( value ) => value.uuid === row.id )[ 0 ];

	// Déclaration des variables d'état.
	const loading = states.loading.length !== 0;
	const [ search, setSearch ] = useState( "" );
	const { data, error, isLoading } = useSWR<User[]>(
		search !== ""
			? `${ process.env.__NEXT_ROUTER_BASEPATH }/api/user/search/${ search }`
			: null,
		fetcher
	);

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Lien de partage */}
			<div className="flex space-x-2">
				<Input
					type="url"
					value={new URL( file.path, window.location.href ).href}
					readOnly
				/>

				<Button variant="secondary">
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier
				</Button>
			</div>

			{/* Séparateur horizontal */}
			<Separator />

			{/* Liste des utilisateurs partagés */}
			<section>
				<h4 className="text-sm font-medium max-sm:text-center">
					<Users className="mr-2 inline h-4 w-4" />

					<span className="align-middle">
						Liste des utilisateurs en partage
					</span>
				</h4>

				{file.shares.length === 0 ? (
					<p className="pt-4 text-sm text-muted-foreground">
						Aucun utilisateur n&lsquo;a accès à ce fichier.
					</p>
				) : (
					file.shares.map( ( share ) => (
						<article className="mt-3 flex flex-wrap items-center gap-3 max-sm:justify-center">
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
							<div>
								<p className="text-sm">{share.user.name}</p>

								<p className="text-sm text-muted-foreground">
									{share.user.email}
								</p>
							</div>

							{/* Autorisations accordées */}
							<div className="flex gap-3 sm:ml-auto">
								<Select disabled={loading} defaultValue="write">
									<SelectTrigger className="ml-auto w-auto">
										<SelectValue />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="write">
											{loading && (
												<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
											)}

											<span className="mr-2">
												Écriture
											</span>
										</SelectItem>

										<SelectItem value="read">
											{loading && (
												<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
											)}

											<span className="mr-2">
												Lecture
											</span>
										</SelectItem>

										<SelectItem value="admin">
											{loading && (
												<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
											)}

											<span className="mr-2">
												Gestion
											</span>
										</SelectItem>
									</SelectContent>
								</Select>

								<Button
									variant="destructive"
									disabled={loading}
								>
									<Trash className="h-4 w-4" />
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
				<h4 className="text-sm font-medium max-sm:text-center">
					<UserCog className="mr-2 inline h-4 w-4" />

					<span className="align-middle">
						Ajouts de nouveaux utilisateurs en partage
					</span>
				</h4>

				<Input
					type="text"
					value={search}
					onChange={( event ) => setSearch( event.target.value )}
					disabled={loading}
					maxLength={50}
					className="mt-3"
					spellCheck="false"
					placeholder="Rechercher..."
					autoComplete="off"
					autoCapitalize="off"
				/>

				<p className="mt-4 text-sm text-muted-foreground">
					<strong>{data?.length ?? 0}</strong> résultat(s) trouvé(s)
					dans la base de données.
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
					<ul className={data && data.length > 0 ? "mt-4" : ""}>
						{data
							&& data.map( ( user, index ) => (
								<li
									key={user.id}
									className="flex flex-wrap items-center gap-3 max-sm:justify-center"
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
									<div>
										<p className="text-sm">{user.name}</p>

										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>

									{/* Bouton d'ajout de l'utilisateur */}
									<Button
										disabled={loading}
										className="mr-4 sm:ml-auto"
									>
										<UserPlus className="mr-2 h-4 w-4" />
										Ajouter
									</Button>

									{/* Séparateur horizontal */}
									{index !== data.length - 1 && (
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