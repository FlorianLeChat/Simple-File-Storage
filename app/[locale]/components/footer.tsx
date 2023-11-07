//
// Composant de navigation du pied de page.
//
import { Separator } from "./ui/separator";

export default function Footer()
{
	// Affichage du rendu HTML du composant.
	return (
		<footer className="mt-auto flex flex-col text-center text-muted-foreground">
			{/* Séparateur horizontal */}
			<Separator className="w-full" />

			{/* Informations sur le site */}
			<p className="block p-4 text-sm">
				© {new Date().getFullYear()} 💾 Simple File Storage. Tous
				droits réservés.

				{/* Avertissement de Google reCAPTCHA */}
				{process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true" && (
					<small className="block text-xs leading-5 max-sm:mt-1">
						Ce site est protégé par reCAPTCHA sur lequel
						s&lsquo;appliquent les{" "}
						<a
							rel="noopener noreferrer"
							href="https://policies.google.com/privacy"
							target="_blank"
							className="underline underline-offset-4 hover:text-primary"
						>
							politiques de confidentialité
						</a>{" "}
						et les{" "}
						<a
							rel="noopener noreferrer"
							href="https://policies.google.com/terms"
							target="_blank"
							className="underline underline-offset-4 hover:text-primary"
						>
							conditions d&lsquo;utilisation
						</a>{" "}
						de Google.
					</small>
				)}
			</p>
		</footer>
	);
}