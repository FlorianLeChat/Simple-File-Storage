//
// Composant de restauration des versions précédentes d'un fichier.
//

"use client";

import { toast } from "sonner";
import { useState } from "react";
import { formatSize } from "@/utilities/react-table";
import type { FileAttributes } from "@/interfaces/File";
import type { Table, Row, TableMeta } from "@tanstack/react-table";
import { Ban, Check, History, ArrowUpRight } from "lucide-react";

import serverAction from "@/utilities/recaptcha";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { restoreVersion } from "../actions";
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

export default function FileHistory( {
	table,
	row
}: {
	table: Table<FileAttributes>;
	row: Row<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const states = table.options.meta as TableMeta<FileAttributes>;
	const file = states.files.filter( ( value ) => value.uuid === row.id )[ 0 ];
	const count = file.versions.length ?? 0;

	// Déclaration des variables d'état.
	const loading = states.loading.length !== 0;
	const [ identifier, setIdentifier ] = useState( "" );

	// Affichage du rendu HTML du composant.
	return (
		<ScrollArea className="h-72 rounded-md border">
			{/* Aucune version précédente */}
			{count === 0 && (
				<p className="inline-block p-4 text-sm text-muted-foreground">
					Aucune révision précédente n&lsquo;est disponible pour ce
					fichier.
				</p>
			)}

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
								du {version.date.toLocaleString()}
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

							{/* Actions sur la révision */}
							<div className="my-2 flex items-center gap-2">
								<a
									rel="noreferrer noopener"
									href={version.path}
									target="_blank"
									className={buttonVariants()}
								>
									{/* Accès au fichier */}
									<ArrowUpRight className="mr-2 h-4 w-4" />
									Accéder
								</a>

								<AlertDialog>
									<AlertDialogTrigger
										disabled={index === 0 || loading}
										className={buttonVariants( {
											variant: "secondary"
										} )}
										onClick={() => setIdentifier( version.uuid )}
									>
										{/* Restauration de la version */}
										<History className="mr-2 h-4 w-4" />
										Restaurer
									</AlertDialogTrigger>

									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												<History className="mr-2 inline h-5 w-5 align-text-top" />
												Êtes-vous sûr de vouloir
												restaurer cette version du
												fichier ?
											</AlertDialogTitle>

											<AlertDialogDescription>
												La version actuelle du fichier
												sera sauvegardée sous forme
												d&lsquo;une nouvelle version et
												remplacée par la version
												sélectionnée.
											</AlertDialogDescription>
										</AlertDialogHeader>

										<AlertDialogFooter>
											<AlertDialogCancel
												disabled={loading}
											>
												<Ban className="mr-2 h-4 w-4" />
												Annuler
											</AlertDialogCancel>

											<AlertDialogAction
												onClick={async () =>
												{
													// Activation de l'état de chargement.
													states.setLoading( [
														"history"
													] );

													// Création d'un formulaire de données.
													const form = new FormData();
													form.append(
														"fileId",
														file.uuid
													);
													form.append(
														"versionId",
														identifier
													);

													// Envoi de la requête au serveur et
													//  attente de la réponse.
													const data =
														( await serverAction(
															restoreVersion,
															form
														) ) as string;

													if ( data )
													{
														// Sélection de la version sélectionnée
														//  pour être restaurée.
														const selectedVersion =
															file.versions.find(
																( value ) => value.uuid
																	=== identifier
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
														newVersion.uuid = data;

														// Ajout de la nouvelle version à la liste
														//  des versions du fichier.
														file.versions.unshift(
															newVersion
														);

														// Mise à jour de la liste des fichiers.
														states.setFiles(
															states.files
														);
													}

													// Fin de l'état de chargement.
													states.setLoading( [] );

													// Envoi d'une notification.
													if ( data )
													{
														toast.success(
															"form.info.action_success",
															{
																description:
																	"form.info.version_restored"
															}
														);
													}
													else
													{
														toast.error(
															"form.errors.action_failed",
															{
																description:
																	"form.errors.server_error"
															}
														);
													}
												}}
												disabled={loading}
											>
												<Check className="mr-2 h-4 w-4" />
												Confirmer
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>

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