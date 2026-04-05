import { fetchMetadata } from "@/utilities/metadata";

export default async function Sitemap()
{
	const date = new Date();
	const baseUrl = new URL( ( await fetchMetadata() )?.metadataBase ?? "" );

	return [
		{
			url: baseUrl,
			lastModified: date
		},
		{
			url: baseUrl + "authentication",
			lastModified: date
		},
		{
			url: baseUrl + "legal/terms",
			lastModified: date
		},
		{
			url: baseUrl + "legal/privacy",
			lastModified: date
		}
	];
}