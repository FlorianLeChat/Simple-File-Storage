//
// Ajout la gestion des erreurs et de suivi des performances côté serveur avec Sentry.
//  Source : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
//
import { init } from "@sentry/nextjs";

export async function register()
{
	if (
		process.env.NEXT_RUNTIME === "nodejs"
		|| process.env.NEXT_RUNTIME === "edge"
	)
	{
		init( {
			dsn: process.env.SENTRY_DSN,
			tracesSampleRate:
				process.env.NODE_ENV === "development" ? 1.0 : 0.01
		} );
	}
}