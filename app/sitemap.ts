//
// Route vers le fichier du plan du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
//
import { generateMetadata } from "./[locale]/layout";

export default async function Sitemap()
{
	// Déclaration des constantes.
	const date = new Date();
	const baseUrl = new URL( ( await generateMetadata() )?.metadataBase ?? "" );
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
		}
	];
}