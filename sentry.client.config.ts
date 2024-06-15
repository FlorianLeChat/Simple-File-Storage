//
// Ajout la gestion des erreurs et de suivi des performances côté client avec Sentry.
//  Source : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
//
import { init, replayIntegration } from "@sentry/nextjs";

init( {
	dsn: process.env.SENTRY_DSN,
	integrations: [
		replayIntegration( {
			maskAllText: true,
			blockAllMedia: true
		} )
	],
	tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.01,
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1
} );