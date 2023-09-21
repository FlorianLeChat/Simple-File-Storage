//
// Structure HTML générale des paramètres du site.
//

// Importation des dépendances.
import type { Metadata } from "next";
import { lazy, type ReactNode } from "react";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Navigation = lazy( () => import( "./components/navigation" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Paramètres"
};

// Déclaration des routes disponibles pour la page.
const routes = [
	{
		title: "Profil utilisateur",
		href: "/settings"
	},
	{
		title: "Compte utilisateur",
		href: "/settings/account"
	},
	{
		title: "Apparence",
		href: "/settings/layout"
	}
];

export default function Layout( { children }: { children: ReactNode } )
{
	return (
		<div className="hidden space-y-6 p-10 pb-16 md:block">
			<header className="space-y-0.5">
				<h2 className="text-2xl font-bold tracking-tight">
					Paramètres générales
				</h2>

				<p className="text-muted-foreground">
					Manage your account settings and set e-mail preferences.
				</p>
			</header>

			<Separator className="my-6" />

			<main className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
				<Navigation routes={routes} />

				<div className="flex-1 lg:max-w-2xl">{children}</div>
			</main>
		</div>
	);
}