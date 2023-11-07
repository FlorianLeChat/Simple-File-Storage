//
// Composant de restauration des versions précédentes d'un fichier.
//
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

const tags = Array.from( { length: 9 } ).map(
	( _, i, a ) => `Version du ${ a.length - i }/08/2023 - ${ i + 1 }0h${ i + 1 }0`
);

export default function FileHistory()
{
	// Affichage du rendu HTML du composant.
	return (
		<ScrollArea className="h-72 rounded-md border">
			{/* Liste des révisions */}
			<ul className="p-4">
				{tags.map( ( tag ) => (
					<li key={tag} className="text-sm">
						{/* Nom de la révision */}
						<h3>{tag}</h3>

						{/* Taille et différence de la révision */}
						<p className="inline-block text-sm text-muted-foreground">
							{Math.floor( Math.random() * 500 )} Mo
						</p>

						<p className="ml-2 inline-block text-sm font-extrabold text-primary">
							-{Math.floor( Math.random() * 100 )} Ko
						</p>

						<p className="ml-2 inline-block text-sm font-extrabold text-destructive">
							+{Math.floor( Math.random() * 100 )} Ko
						</p>

						{/* Actions sur la révision */}
						<div className="my-2 flex items-center gap-2">
							<a
								rel="noreferrer noopener"
								href="https://www.google.fr/"
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
						<Separator className="my-4" />
					</li>
				) )}
			</ul>
		</ScrollArea>
	);
}