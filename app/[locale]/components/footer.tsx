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

				{/* Avertissement de la présence d'un CAPTCHA */}
				{process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === "true" && (
					<small className="block text-xs leading-5 max-sm:mt-1">
						{messages.rich( "footer.captcha_protected", {
							a: ( chunks ) => (
								<a
									rel="noopener noreferrer"
									href="https://altcha.org/"
									target="_blank"
									className="underline decoration-dotted underline-offset-4 dark:hover:text-foreground"
								>
									{chunks}
								</a>
							)
						} )}
					</small>
				)}
			</p>
		</footer>
	);
}