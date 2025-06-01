import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin( "./utilities/i18n.ts" );
const nextConfig: NextConfig = withNextIntl( {
	serverExternalPackages: [ "pino", "pino-pretty" ], // https://github.com/vercel/next.js/discussions/46987#discussioncomment-8464812
	poweredByHeader: false,
	experimental: {
		serverActions: {
			bodySizeLimit: Number( process.env.NEXT_PUBLIC_MAX_QUOTA )
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

export default nextConfig;