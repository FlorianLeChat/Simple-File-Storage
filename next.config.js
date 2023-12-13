// @ts-check

/**
 * @type {import("next").NextConfig}
 */
const { withSentryConfig } = require( "@sentry/nextjs" );
const withNextIntl = require( "next-intl/plugin" )( "./utilities/i18n.ts" );

const nextConfig = withNextIntl( {
	poweredByHeader: false,
	experimental: { webpackBuildWorker: true }, // https://github.com/getsentry/sentry-javascript/discussions/9424
	basePath: "",
	sentry: {
		tunnelRoute: "/monitoring",
		disableLogger: true,
		hideSourceMaps: true,
		widenClientFileUpload: true
	},
	async redirects()
	{
		return [
			{
				// Redirection de la page d'accueil des paramètres
				//  vers l'onglet par défaut du profil utilisateur.
				source: "/settings",
				permanent: true,
				destination: "/settings/profile"
			}
		];
	}
} );

const sentryConfig = {
	org: process.env.SENTRY_ORG,
	silent: true,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN
};

module.exports = process.env.SENTRY_ENABLED === "true"
	? withSentryConfig( nextConfig, sentryConfig )
	: nextConfig;