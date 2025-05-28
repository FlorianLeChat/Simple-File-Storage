//
// Composant du pied de page du site.
//
import { getTranslations } from "next-intl/server";
import { Separator } from "./ui/separator";

export default async function Footer()
{
	// Récupération des constantes.
	const messages = await getTranslations();

	// Affichage du rendu HTML du composant.
	return (
		<footer className="mt-auto flex flex-col text-center text-muted-foreground">
			{/* Séparateur horizontal */}
			<Separator className="w-full" />

			{/* Informations sur le site */}
			<p className="block p-4 text-sm">
				© {new Date().getFullYear()} 💾 Simple File Storage.{" "}
				{messages( "footer.rights_reserved" )}.

			</p>
		</footer>
	);
}