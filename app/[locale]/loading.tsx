//
// Page de chargement des composants asynchrones.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/loading
//
import { Loader2 } from "lucide-react";

export default function Loading()
{
	// Affichage du rendu HTML du composant.
	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4 text-4xl font-bold uppercase">
			💾 Simple File Storage
			<Loader2 className="h-14 w-14 animate-spin" />
		</div>
	);
}