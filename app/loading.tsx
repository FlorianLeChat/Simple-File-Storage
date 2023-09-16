//
// Page de chargement des composants asynchrones.
//  Source : https://nextjs.org/docs/app/api-reference/file-conventions/loading
//
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loading( { title }: { title: string } )
{
	// Affichage du rendu HTML du composant.
	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4 text-4xl font-bold uppercase">
			💾 {title}
			<FontAwesomeIcon spin icon={faSpinner} />
		</div>
	);
}