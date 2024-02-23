//
// Composant de restauration des versions précédentes d'un fichier.
//

"use client";

import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import serverAction from "@/utilities/recaptcha";
import { formatSize } from "@/utilities/react-table";
import type { TableMeta } from "@tanstack/react-table";
import { useRef, useState } from "react";
import type { FileAttributes } from "@/interfaces/File";
import { Ban, Check, History, ShieldCheck, ArrowUpRight } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { restoreVersion } from "../actions";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogDescription } from "../../components/ui/alert-dialog";
import { Button, buttonVariants } from "../../components/ui/button";

export default function FileHistory( {
	file,
	states
}: {
	file: FileAttributes;
	states: TableMeta<FileAttributes>;
} )
{
	// Déclaration des variables d'état.
	const [ password, setPassword ] = useState( "" );
	const [ identifier, setIdentifier ] = useState( "" );

	// Déclaration des constantes.
	const count = file.versions.length ?? 0;
	const access = useRef<HTMLButtonElement>( null );

	// Soumission de la restauration de la version.
	const submitRestoration = async () =>
	{
		// Activation de l'état de chargement.
		states.setLoading( true );

		// Création d'un formulaire de données.
		const form = new FormData();
		form.append( "fileId", file.uuid );
		form.append( "versionId", identifier );

		// Envoi de la requête au serveur et
		//  attente de la réponse.
		const data = await serverAction( restoreVersion, form );

		// Fin de l'état de chargement.
		states.setLoading( false );

		if ( data )
		{
			// Sélection de la version sélectionnée
			//  pour être restaurée.
			const selectedVersion = file.versions.find(
				( value ) => value.uuid === identifier
			);

			if ( !selectedVersion )
			{
				return;
			}

			// Copie et modification de l'identifiant
			//  de la version sélectionnée.
			const newVersion = {
				...selectedVersion
			};

			newVersion.uuid = data as string;

			// Ajout de la nouvelle version à la liste
			//  des versions du fichier.
			file.versions.unshift( newVersion );

			// Mise à jour de la liste des fichiers.
			states.setFiles( states.files );

			// Envoi d'une notification de succès.
			toast.success( "form.info.action_success", {
				description: "form.info.version_restored"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.action_failed", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Affichage du rendu HTML du composant.
	return (
		<ScrollArea className="h-72 rounded-md border">
			{/* Liste des révisions */}
			<ul className="p-4">
				{file.versions.map( ( version, index ) =>
				{
					// Calcul de la différence de taille entre la version
					//  actuelle et la version précédente.
					const size =
						version.size
						- file.versions[ Math.min( index + 1, count - 1 ) ].size;

					// Définition de la couleur en fonction de la différence de
					//  taille (vert si négatif, rouge si positif, gris si nul).
					const color =
						size === 0
							? "text-gray-600"
							: ( size < 0 && "text-green-600" )
								|| "text-destructive";

					// Mise en forme de la différence de taille.
					const offset =
						size < 0
							? `-${ formatSize( size ) }`
							: `+${ formatSize( size ) }`;

					return (
						<li key={version.uuid} className="text-sm">
							{/* Nom de la révision */}
							<h3>
								Version{" "}
								{index === 0
									? "actuelle"
									: ( index === count - 1 && "initiale" )
										|| "antérieure"}{" "}
								du{" "}
								{new Intl.DateTimeFormat( undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "numeric",
									minute: "numeric",
									second: "numeric"
								} ).format( version.date )}
							</h3>

							{/* Taille et différence de la révision */}
							<p className="inline-block text-muted-foreground">
								{formatSize( version.size )}
							</p>

							<p
								className={`ml-2 inline-block font-extrabold ${ color }`}
							>
								{index === file.versions.length - 1
									? ""
									: offset}
							</p>

							{/* Saut de ligne */}
							<br />

							{/* Accès au fichier */}
							{version.encrypted ? (
								<Dialog>
									<DialogTrigger
										className={merge(
											buttonVariants(),
											"mr-2 mt-2"
										)}
									>
										<ArrowUpRight className="mr-2 h-4 w-4" />
										Accéder
									</DialogTrigger>

									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												<ShieldCheck className="mr-2 inline h-5 w-5 align-text-top" />
												Veuillez saisir la clé de
												déchiffrement.
											</DialogTitle>

											<DialogDescription>
												La version de ce fichier est
												chiffrée par une clé que le
												serveur ne possède pas. Pour
												accéder à la ressource, veuillez
												saisir la clé de déchiffrement
												qui vous a été fournie lors du
												téléversement de cette version.{" "}
												<strong>
													En cas de perte, vous ne
													pouvez plus accéder à cette
													version. Si c&lsquo;est le
													cas, restaurez une version
													antérieure ou supprimez le
													fichier afin de le
													téléverser à nouveau.
												</strong>
											</DialogDescription>
										</DialogHeader>

										<Input
											type="text"
											onInput={( event ) =>
											{
												// Mise à jour de l'entrée utilisateur.
												setPassword(
													event.currentTarget.value
												);
											}}
											onKeyDown={( event ) =>
											{
												// Soumission du formulaire par clavier.
												if (
													event.key.endsWith( "Enter" )
												)
												{
													access.current?.click();
												}
											}}
											spellCheck="false"
											placeholder="your_key"
											autoComplete="off"
											autoCapitalize="off"
										/>

										<Button
											ref={access}
											onClick={() =>
											{
												// Ouverture de la version dans un nouvel onglet.
												window.open(
													new URL(
														`${ version.path }&key=${ password }`,
														window.location.href
													).href,
													"_blank",
													"noopener,noreferrer"
												);
											}}
											disabled={
												states.loading || !password
											}
											className="max-sm:w-full"
										>
											<ArrowUpRight className="mr-2 h-4 w-4" />
											Accéder
										</Button>
									</DialogContent>
								</Dialog>
							) : (
								<a
									rel="noreferrer noopener"
									href={version.path}
									target="_blank"
									className={merge(
										buttonVariants(),
										"mr-2 mt-2"
									)}
								>
									<ArrowUpRight className="mr-2 h-4 w-4" />
									Accéder
								</a>
							)}

							{/* Restauration de la version */}
							<AlertDialog>
								<AlertDialogTrigger
									onClick={() => setIdentifier( version.uuid )}
									disabled={index === 0 || states.loading}
									className={buttonVariants( {
										variant: "secondary"
									} )}
								>
									<History className="mr-2 h-4 w-4" />
									Restaurer
								</AlertDialogTrigger>

								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											<History className="mr-2 inline h-5 w-5 align-text-top" />
											Êtes-vous sûr de vouloir restaurer
											cette version du fichier ?
										</AlertDialogTitle>

										<AlertDialogDescription>
											La version actuelle du fichier sera
											sauvegardée sous forme d&lsquo;une
											nouvelle version et remplacée par la
											version sélectionnée.
										</AlertDialogDescription>
									</AlertDialogHeader>

									<AlertDialogFooter>
										<AlertDialogCancel
											disabled={states.loading}
										>
											<Ban className="mr-2 h-4 w-4" />
											Annuler
										</AlertDialogCancel>

										<AlertDialogAction
											onClick={submitRestoration}
											disabled={states.loading}
										>
											<Check className="mr-2 h-4 w-4" />
											Confirmer
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							{/* Séparateur horizontal */}
							{index !== file.versions.length - 1 && (
								<Separator className="my-4" />
							)}
						</li>
					);
				} )}
			</ul>
		</ScrollArea>
	);
}