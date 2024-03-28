//
// Composant de la fenêtre modale de sauvegarde du code de secours.
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useTranslations } from "next-intl";
import { Smartphone, ClipboardCopy } from "lucide-react";

import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { buttonVariants } from "../../components/ui/button";

export default function OTPBackupModal( { code }: { code: string } )
{
	// Déclaration des variables d'état.
	const messages = useTranslations( "modals.otp_backup" );

	// Affichage du rendu HTML du composant.
	return (
		<Dialog defaultOpen>
			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Smartphone className="mr-2 inline h-5 w-5" />
						{messages( "title" )}
					</DialogTitle>

					<DialogDescription className="text-left">
						{messages.rich( "description", {
							b: ( chunks ) => <strong>{chunks}</strong>
						} )}
						<br />
						<br />
						<code>{code}</code>
					</DialogDescription>
				</DialogHeader>

				<DialogClose
					onClick={() => navigator.clipboard.writeText( code )}
					className={merge( buttonVariants(), "w-full" )}
				>
					<ClipboardCopy className="mr-2 h-4 w-4" />
					{messages( "close" )}
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}