//
// Composant de requête d'une clé de déchiffrement.
//

"use client";

import { Ban, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

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
	// Déclaration des variables d'état.
	const [ password, setPassword ] = useState( "" );

	// Déclaration des constantes.
	const access = useRef<HTMLButtonElement>( null );

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

				<Input
					onInput={( event ) =>
					{
						// Mise à jour de l'entrée utilisateur.
						setPassword( event.currentTarget.value );
					}}
					onKeyDown={( event ) =>
					{
						// Soumission du formulaire par clavier.
						if ( event.key.endsWith( "Enter" ) )
						{
							access.current?.click();
						}
					}}
					spellCheck="false"
					placeholder="your_key"
					autoComplete="off"
					autoCapitalize="off"
				/>

				<AlertDialogFooter>
					<AlertDialogCancel>
						<Ban className="mr-2 h-4 w-4" />
						Annuler
					</AlertDialogCancel>

					<AlertDialogAction
						ref={access}
						onClick={() =>
						{
							// Ouverture de la version dans un nouvel onglet.
							window.open(
								new URL(
									`${ url }${ password }`,
									window.location.href
								).href,
								"_blank",
								"noopener,noreferrer"
							);
						}}
						disabled={!password}
					>
						<ArrowUpRight className="mr-2 h-4 w-4" />
						Accéder
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}