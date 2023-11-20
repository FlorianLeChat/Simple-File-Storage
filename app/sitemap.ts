//
// Route vers le fichier du plan du site.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
//
import { generateMetadata } from "./[locale]/layout";

export default async function Sitemap()
{
	// Déclaration des constantes.
	const metadata = await generateMetadata();
	const date = new Date();
	const base = metadata?.metadataBase ?? "";

	// Génération du plan du site.
	return [
		{
			// Page d'accueil.
			url: base,
			lastModified: date
		},
		{
			// Page d'authentification.
			url: new URL( "authentication", base ).href,
			lastModified: date
		}
	];
}