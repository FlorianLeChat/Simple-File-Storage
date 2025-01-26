//
// Ajout la gestion des erreurs et de suivi des performances côté serveur avec Sentry.
//  Source : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
//
import { init, captureRequestError } from "@sentry/nextjs";

export const onRequestError = captureRequestError;

export async function register()
{
	const runtime = process.env.NEXT_RUNTIME;
	const isNodeRuntime = runtime === "nodejs";
	const isEdgeRuntime = runtime === "edge";
	const isDevelopment = process.env.NODE_ENV === "development";

	if ( isNodeRuntime || isEdgeRuntime )
	{
		init( {
			dsn: process.env.SENTRY_DSN,
			tracesSampleRate: isDevelopment ? 1.0 : 0.01
		} );
	}
}