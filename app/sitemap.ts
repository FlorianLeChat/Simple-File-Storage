//
// Route vers le fichier du plan du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
//
import { fetchMetadata } from "@/utilities/metadata";

export default async function Sitemap()
{
	// Déclaration des constantes.
	const date = new Date();
	const baseUrl = new URL( ( await fetchMetadata() )?.metadataBase ?? "" );
	const pathname = baseUrl.pathname.endsWith( "/" )
		? baseUrl.pathname
		: `${ baseUrl.pathname }/`;

	// Génération du plan du site.
	return [
		{
			// Page d'accueil.
			url: baseUrl,
			lastModified: date
		},
		{
			// Page d'authentification.
			url: new URL( `${ pathname }authentication`, baseUrl ),
			lastModified: date
		},
		{
			// Conditions d'utilisation.
			url: new URL( `${ pathname }legal/terms`, baseUrl ),
			lastModified: date
		},
		{
			// Politique de confidentialité.
			url: new URL( `${ pathname }legal/privacy`, baseUrl ),
			lastModified: date
		}
	];
}