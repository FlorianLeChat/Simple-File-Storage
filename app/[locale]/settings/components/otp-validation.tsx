//
// Composant de la fenêtre modale de validation de l'authentification à deux facteurs.
//

"use client";

import Image from "next/image";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useState } from "react";
import serverAction from "@/utilities/recaptcha";
import { useTranslations } from "next-intl";
import { Check, Loader2, Smartphone } from "lucide-react";

import OTPBackupModal from "./otp-backup";
import { validateOTP } from "../actions/validate-otp";
import { Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { InputOTP,
	InputOTPSlot,
	InputOTPGroup,
	InputOTPSeparator } from "../../components/ui/input-otp";
import { Button, buttonVariants } from "../../components/ui/button";

export default function OTPValidationModal( {
	image,
	secret
}: {
	image: string;
	secret: string;
} )
{
	// Déclaration des variables d'état.
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals.otp_validation" );
	const [ otpCode, setOTPCode ] = useState( "" );
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
			toast.success( formMessages( "infos.action_success" ), {
				description: formMessages( "infos.otp_enabled" )
			} );
		}
		else
		{
			// Envoi d'une notification d'erreur.
			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
				{modalMessages( "trigger" )}
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[50%]">
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Smartphone className="mr-2 inline h-5 w-5" />
						{modalMessages( "title" )}
					</DialogTitle>

					<Image
						src={image}
						alt="QR Code"
						width={164}
						height={164}
						className="!mb-2 !mt-4"
					/>

					<DialogDescription className="text-left">
						{modalMessages.rich( "description", {
							b: ( chunks ) => <strong>{chunks}</strong>,
							br: () => <br />,
							a1: ( chunks ) => (
								<a
									rel="noopener noreferrer"
									href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
									target="_blank"
									className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
								>
									{chunks}
								</a>
							),
							a2: ( chunks ) => (
								<a
									rel="noopener noreferrer"
									href="https://play.google.com/store/apps/details?id=com.authy.authy"
									target="_blank"
									className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
								>
									{chunks}
								</a>
							)
						} )}
					</DialogDescription>
				</DialogHeader>

				<form
					id="validate-otp-form"
					onSubmit={( event ) =>
					{
						// Arrêt du comportement par défaut.
						event.preventDefault();

						// Récupération de la valeur du champ de saisie.
						submitOTPValidation( otpCode );
					}}
				>
					<InputOTP
						value={otpCode}
						onChange={( value ) => setOTPCode( value )}
						maxLength={6}
						className="!w-auto"
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
						</InputOTPGroup>

						<InputOTPSeparator />

						<InputOTPGroup>
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
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
							{formMessages( "loading" )}
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