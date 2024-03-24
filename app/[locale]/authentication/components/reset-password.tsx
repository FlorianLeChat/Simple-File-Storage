//
// Composant de réinitialisation du mot de passe pour le formulaire d'authentification.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useTranslations } from "next-intl";
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
	// Déclaration des variables d'état.
	const messages = useTranslations( "modals.reset_password" );

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
				{messages( "trigger" )}
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<ShieldQuestion className="mr-2 inline h-5 w-5" />
						{messages( "title" )}
					</DialogTitle>

					<DialogDescription className="text-left">
						{messages.rich( "description", {
							b: ( chunks ) => <strong>{chunks}</strong>
						} )}
					</DialogDescription>
				</DialogHeader>

				<DialogClose className={merge( buttonVariants(), "w-full" )}>
					<Check className="mr-2 h-4 w-4" />
					{messages( "close" )}
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}