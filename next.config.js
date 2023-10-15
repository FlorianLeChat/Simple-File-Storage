// @ts-check

/**
 * @type {import("next").NextConfig}
 */
const { withSentryConfig } = require( "@sentry/nextjs" );
const nextConfig = {
	poweredByHeader: false,
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
};

const sentryConfig = {
	org: process.env.SENTRY_ORG,
	silent: true,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN
};

module.exports = withSentryConfig( nextConfig, sentryConfig );