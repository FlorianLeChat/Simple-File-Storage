//
// Composant de requête d'une clé de déchiffrement.
//

"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
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
	// Déclaration des variables d'état.
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals.request-key" );

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
						{modalMessages( "title" )}
					</AlertDialogTitle>

					<AlertDialogDescription>
						{modalMessages.rich( "description", {
							b: ( text ) => <strong>{text}</strong>
						} )}
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
						placeholder={modalMessages( "placeholder" )}
						autoComplete="off"
						autoCapitalize="off"
					/>
				</form>

				<AlertDialogFooter>
					<AlertDialogCancel type="reset" form="request-key-form">
						<Ban className="mr-2 h-4 w-4" />
						{formMessages( "cancel" )}
					</AlertDialogCancel>

					<AlertDialogAction type="submit" form="request-key-form">
						<ArrowUpRight className="mr-2 h-4 w-4" />
						{formMessages( "confirm" )}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}