//
// Route des erreurs globales émises par Next.js.
//  Source : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router
//

"use client";

// Importation des dépendances.
import NextError from "next/error";
import { useEffect } from "react";
import { captureException } from "@sentry/nextjs";

export default function GlobalError( {
	error
}: {
	error: Error & { digest?: string };
} )
{
	// Capture de l'erreur avec Sentry.
	useEffect( () =>
	{
		captureException( error );
	}, [ error ] );

	// Affichage du rendu HTML du composant.
	return (
		<html lang="en">
			<body>
				<NextError statusCode={undefined as never} />
			</body>
		</html>
	);
}