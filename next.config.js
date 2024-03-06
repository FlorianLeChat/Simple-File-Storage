// @ts-check

/**
 * @type {import("next").NextConfig}
 */
const { withSentryConfig } = require( "@sentry/nextjs" );
const withNextIntl = require( "next-intl/plugin" )( "./utilities/i18n.ts" );
const million = require( "million/compiler" );

const nextConfig = million.next(
	withNextIntl( {
		poweredByHeader: false,
		experimental: {
			// https://github.com/getsentry/sentry-javascript/issues/10366
			serverComponentsExternalPackages: ["@sentry/nextjs", "@sentry/node"],
		},
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
					destination: "/settings/user"
				}
			];
		}
	} ),
	{ auto: { rsc: true } }
);

const sentryConfig = {
	org: process.env.SENTRY_ORG,
	silent: true,
	project: process.env.SENTRY_PROJECT,
	authToken: process.env.SENTRY_AUTH_TOKEN
};

module.exports = process.env.SENTRY_ENABLED === "true"
	? withSentryConfig( nextConfig, sentryConfig )
	: nextConfig;