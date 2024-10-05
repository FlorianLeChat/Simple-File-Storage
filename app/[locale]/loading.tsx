//
// Page de chargement des composants asynchrones.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/loading
//
import { Loader2 } from "lucide-react";
import { generateMetadata } from "./layout";

export default async function Loading()
{
	// Déclaration des constantes.
	const { title } = ( await generateMetadata() ) as { title: string };

	// Affichage du rendu HTML du composant.
	return (
		<div className="absolute m-2 flex size-[calc(100%-1rem)] flex-col items-center justify-center gap-4 bg-background text-center text-3xl font-bold uppercase leading-normal sm:text-4xl">
			💾 {title}
			<Loader2 className="size-14 animate-spin text-primary" />
		</div>
	);
}