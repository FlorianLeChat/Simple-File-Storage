//
// Composant de navigation de l'en-tête.
//
import Link from "next/link";

export default function HeaderNavigation()
{
	return (
		<nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
			<Link
				href="/dashboard"
				className="text-sm font-medium transition-colors hover:text-primary"
			>
				Tableau de bord
			</Link>

			<Link
				href="/settings"
				className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
			>
				Paramètres
			</Link>
		</nav>
	);
}