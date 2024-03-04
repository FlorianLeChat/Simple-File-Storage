//
// Composant de requête d'une clé de déchiffrement.
//

"use client";

import { type ReactNode } from "react";
import { Ban, ShieldCheck, ArrowUpRight } from "lucide-react";

import { Input } from "../../components/ui/input";
import { AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogDescription } from "../../components/ui/alert-dialog";

export default function RequestKey( {
	url,
	children
}: {
	url: string;
	children: ReactNode;
} )
{
	// Déclaration des constantes.
	const base = new URL( url, window.location.href );
	const parameters = base.searchParams;

	// Affichage du rendu HTML du composant.
	return (
		<AlertDialog>
			{children}

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						<ShieldCheck className="mr-2 inline h-5 w-5 align-text-top" />
						Veuillez saisir la clé de déchiffrement.
					</AlertDialogTitle>

					<AlertDialogDescription>
						Cette ressource est chiffrée par une clé que le serveur
						ne possède pas. Pour accéder à celle-ci, veuillez saisir
						la clé de déchiffrement qui vous a été fournie lors de
						son téléversement.{" "}
						<strong>
							En cas de perte, vous ne pourrez plus y accéder. Si
							c&lsquo;est le cas, supprimez-la et téléversez-la à
							nouveau. L&lsquo;assistance technique ne pourra pas
							vous aider car elle ne possède pas la clé de
							déchiffrement.
						</strong>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form
					id="request-key-form"
					rel="noopener noreferrer"
					method="GET"
					target="_blank"
					action={base.href}
				>
					{/* Version d'un fichier */}
					{parameters.get( "v" ) && (
						<input
							type="hidden"
							name="v"
							value={parameters.get( "v" ) as string}
						/>
					)}

					{/* Clé de déchiffrement */}
					<Input
						name="key"
						maxLength={64}
						spellCheck="false"
						placeholder="your_key"
						autoComplete="off"
						autoCapitalize="off"
					/>
				</form>

				<AlertDialogFooter>
					<AlertDialogCancel type="reset" form="request-key-form">
						<Ban className="mr-2 h-4 w-4" />
						Annuler
					</AlertDialogCancel>

					<AlertDialogAction type="submit" form="request-key-form">
						<ArrowUpRight className="mr-2 h-4 w-4" />
						Accéder
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}