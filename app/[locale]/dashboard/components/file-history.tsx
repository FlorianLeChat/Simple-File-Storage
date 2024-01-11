//
// Composant de restauration des versions précédentes d'un fichier.
//

"use client";

import { formatSize } from "@/utilities/react-table";
import type { Table, Row } from "@tanstack/react-table";
import type { FileAttributes } from "@/interfaces/File";
import { Ban, Check, History, ArrowUpRight } from "lucide-react";

import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
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
	const files = table.options.meta?.files ?? [];
	const file = files.filter( ( value ) => value.uuid === row.id )[ 0 ];
	const { versions } = file;

	// Affichage du rendu HTML du composant.
	return (
		<ScrollArea className="h-72 rounded-md border">
			{/* Aucune version précédente */}
			{!versions && (
				<p className="inline-block p-4 text-sm text-muted-foreground">
					Aucune révision précédente n&lsquo;est disponible pour ce
					fichier.
				</p>
			)}

			{/* Liste des révisions */}
			<ul className="p-4">
				{versions?.map( ( version, index ) => (
					<li key={version.id} className="text-sm">
						{/* Nom de la révision */}
						<h3>Version du {version.date}</h3>

						{/* Taille et différence de la révision */}
						<p className="inline-block text-muted-foreground">
							{formatSize( version.size )}
						</p>

						<p className="ml-2 inline-block font-extrabold text-primary">
							-{Math.floor( Math.random() * 100 )} Ko
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
									className={buttonVariants( {
										variant: "secondary"
									} )}
								>
									{/* Restauration de la version */}
									<History className="mr-2 h-4 w-4" />
									Restaurer
								</AlertDialogTrigger>

								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											<History className="mr-2 inline h-5 w-5" />

											<span className="align-middle">
												Êtes-vous sûr de vouloir
												restaurer cette version du
												fichier ?
											</span>
										</AlertDialogTitle>

										<AlertDialogDescription>
											La version actuelle du fichier sera
											sauvegardée et remplacée par la
											version sélectionnée.
										</AlertDialogDescription>
									</AlertDialogHeader>

									<AlertDialogFooter>
										<AlertDialogCancel>
											<Ban className="mr-2 h-4 w-4" />
											Annuler
										</AlertDialogCancel>

										<AlertDialogAction>
											<Check className="mr-2 h-4 w-4" />
											Confirmer
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>

						{/* Séparateur horizontal */}
						{index !== versions.length - 1 && (
							<Separator className="my-4" />
						)}
					</li>
				) )}
			</ul>
		</ScrollArea>
	);
}