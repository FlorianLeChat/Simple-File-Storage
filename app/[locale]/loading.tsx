//
// Page de chargement des composants asynchrones.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/loading
//
import { Loader2 } from "lucide-react";

export default function Loading()
{
	// Affichage du rendu HTML du composant.
	return (
		<div className="m-2 flex h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 text-center text-4xl font-bold uppercase leading-normal">
			💾 Simple File Storage
			<Loader2 className="h-14 w-14 animate-spin text-primary" />
		</div>
	);
}