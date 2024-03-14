//
// Composant de réinitialisation du mot de passe pour le formulaire d'authentification.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { Check, ShieldQuestion } from "lucide-react";

import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { buttonVariants } from "../../components/ui/button";

export default function ResetPasswordModal()
{
	// Affichage du rendu HTML du composant.
	return (
		<Dialog>
			<DialogTrigger
				className={merge(
					buttonVariants( {
						variant: "link"
					} ),
					"h-auto p-0 text-muted-foreground underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
				)}
			>
				Vous avez oublié votre mot de passe ?
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<ShieldQuestion className="mr-2 inline h-5 w-5" />
						Oubli du mot de passe
					</DialogTitle>

					<DialogDescription className="text-left">
						Si vous avez oublié votre mot de passe, essayez de vous
						connecter à votre compte avec un lien
						d&lsquo;authentification à usage unique envoyé à votre
						adresse électronique. Une fois connecté, vous pourrez
						saisir un nouveau mot de passe pour votre compte.
						<br />
						<strong className="mt-1 inline-block">
							En cas de perte de l&lsquo;accès à votre adresse
							électronique, vous devrez recréer un nouveau compte
							car le support technique ne sera pas légalement
							autorisé à vous aider à récupérer l&lsquo;accès à
							votre compte.
						</strong>
					</DialogDescription>
				</DialogHeader>

				<DialogClose className={merge( buttonVariants(), "w-full" )}>
					<Check className="mr-2 h-4 w-4" />
					J&lsquo;ai bien compris
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}