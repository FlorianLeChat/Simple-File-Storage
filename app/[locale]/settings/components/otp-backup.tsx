//
// Composant de la fenêtre modale de sauvegarde du code de secours.
//

"use client";

import { merge } from "@/utilities/tailwind";
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
	// Affichage du rendu HTML du composant.
	return (
		<Dialog defaultOpen>
			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Smartphone className="mr-2 inline h-5 w-5" />
						Code de secours
					</DialogTitle>

					<DialogDescription className="text-left">
						Votre compte est désormais protégé par
						l&lsquo;authentification à deux facteurs. Ci-dessous se
						trouve un code de secours que vous pouvez utiliser afin
						de désactiver l&lsquo;authentification à deux facteurs
						si vous perdez votre téléphone.{" "}
						<strong>
							Si vous perdez ce code, vous devrez contacter le
							support technique mais votre demande pourra être
							refusée en cas de négligence constatée.
						</strong>
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
					Copier dans le presse-papiers
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}