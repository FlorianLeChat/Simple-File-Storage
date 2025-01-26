import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin( "./utilities/i18n.ts" );
const nextConfig: NextConfig = withNextIntl( {
	serverExternalPackages: [ "pino", "pino-pretty" ], // https://github.com/vercel/next.js/discussions/46987#discussioncomment-8464812
	poweredByHeader: false,
	experimental: {
		serverActions: {
			bodySizeLimit: Math.max(
				Number( process.env.NEXT_PUBLIC_MAX_QUOTA ),
				Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE )
			)
		}
	},
	async redirects()
	{
		return [
			{
				// Redirection de la page d'accueil des paramètres
				//  vers l'onglet par défaut du profil utilisateur.
				source: "/settings",
				permanent: true,
				destination: "/settings/user"
			}
		];
	}
} );

const sentryConfig = {
	org: process.env.SENTRY_ORG,
	silent: process.env.NEXT_LOGGING === "false",
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN,
	tunnelRoute: "/monitoring",
	disableLogger: true,
	hideSourceMaps: true,
	widenClientFileUpload: true
};

export default process.env.SENTRY_ENABLED === "true"
	? withSentryConfig( nextConfig, sentryConfig )
	: nextConfig;