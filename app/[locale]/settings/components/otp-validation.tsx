//
// Composant de la fenêtre modale de validation de l'authentification à deux facteurs.
//

"use client";

import Image from "next/image";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useState } from "react";
import serverAction from "@/utilities/recaptcha";
import { Check, Loader2, Smartphone } from "lucide-react";

import { InputOTP,
	InputOTPSlot,
	InputOTPGroup } from "../../components/ui/input-otp";
import { validateOTP } from "../actions/validate-otp";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { Button, buttonVariants } from "../../components/ui/button";
import OTPBackupModal from "./otp-backup";

export default function OTPValidationModal( {
	image,
	secret
}: {
	image: string;
	secret: string;
} )
{
	// Déclaration des variables d'état.
	const [ isLoading, setLoading ] = useState( false );
	const [ backupCode, setBackupCode ] = useState( "" );

	// Soumission de la requête de validation de la double authentification.
	const submitOTPValidation = async ( code: string ) =>
	{
		// Activation de l'état de chargement.
		setLoading( true );

		// Récupération des données du formulaire.
		const formData = new FormData();
		formData.set( "secret", secret );
		formData.set( "code", code );

		// Envoi de la requête au serveur et
		//  traitement de la réponse.
		const state = await serverAction( validateOTP, formData );

		// Fin de l'état de chargement.
		setLoading( false );

		if ( state !== false && state !== "" )
		{
			// Ouverture de la boîte de dialogue pour le
			//  code de secours.
			setBackupCode( state as string );

			// Envoi d'une notification de succès.
			toast.success( "form.info.action_success", {
				description: "form.info.otp_enabled"
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( "form.errors.file_deleted", {
				description: "form.errors.server_error"
			} );
		}
	};

	// Vérification de la présence d'un code de secours.
	if ( backupCode !== "" )
	{
		return <OTPBackupModal code={backupCode} />;
	}

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
				Activation de l&lsquo;authentification à deux facteurs
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Smartphone className="mr-2 inline h-5 w-5" />
						Authentification à deux facteurs
					</DialogTitle>

					<Image
						src={image}
						alt="QR Code"
						width={164}
						height={164}
						className="!mb-2 !mt-4"
					/>

					<DialogDescription className="text-left">
						Afin de sécuriser davantage votre compte, vous pouvez
						activer l&lsquo;authentification à deux facteurs.
						<br />
						<br />
						1. Tout d&lsquo;abord, vous devez scanner le code QR
						ci-dessus avec une application compatible comme{" "}
						<a
							rel="noopener noreferrer"
							href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
							target="_blank"
							className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
						>
							Google Authenticator
						</a>{" "}
						ou{" "}
						<a
							rel="noopener noreferrer"
							href="https://play.google.com/store/apps/details?id=com.authy.authy"
							target="_blank"
							className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
						>
							Authy
						</a>
						.
						<br />
						<br />
						2. Une fois activée, veuillez saisir ci-dessous le code
						de sécurité généré par votre application pour valider la
						double authentification.
						<br />
						<br />
						3. Lorsque la double authentification est validée, vous
						serez invité à sauvegarder un code de secours pour
						désactiver la double authentification si vous perdez
						votre téléphone.
					</DialogDescription>
				</DialogHeader>

				<form
					id="validate-otp-form"
					onSubmit={( event ) =>
					{
						// Arrêt du comportement par défaut.
						event.preventDefault();

						// Récupération de la valeur du champ de saisie.
						const element = event.currentTarget.children[ 0 ]
							.children[ 1 ] as HTMLInputElement;

						submitOTPValidation( element.value );
					}}
				>
					<InputOTP
						name="code"
						render={( { slots } ) => (
							<InputOTPGroup>
								{slots.map( ( slot, index ) => (
									<InputOTPSlot {...slot} key={index} />
								) )}
							</InputOTPGroup>
						)}
						maxLength={6}
					/>
				</form>

				<Button
					type="submit"
					form="validate-otp-form"
					disabled={isLoading}
					className="w-full"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Veuillez patienter...
						</>
					) : (
						<>
							<Check className="mr-2 h-4 w-4" />
							Activer l&lsquo;authentification à deux facteurs
						</>
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}