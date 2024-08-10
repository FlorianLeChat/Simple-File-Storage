//
// Structure HTML générale des documents légaux.
//

// Importation des dépendances.
import Link from "next/link";
import { lazy, type ReactNode } from "react";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "../layout";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "../components/navigation" ) );
const Notification = lazy( () => import( "../components/notification" ) );

export default async function Layout( {
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await generateMetadata();
	const session = await auth();

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="container mx-auto flex min-h-[4rem] flex-wrap items-center justify-center gap-y-4 px-4 py-8 md:gap-x-4 md:py-4">
				{/* Titre du site */}
				<h1 className="text-center text-2xl font-semibold max-md:w-full max-md:overflow-hidden max-md:text-ellipsis max-md:whitespace-nowrap md:max-w-fit md:text-xl">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

				{session && (
					<>
						{/* Navigation du site */}
						<Navigation
							theme={session.user.preferences.theme}
							source={meta.source}
						/>

						{/* Éléments latéraux */}
						<aside className="flex items-center justify-center space-x-4 md:ml-auto">
							{/* Notifications */}
							<Notification />

							{/* Menu utilisateur */}
							<UserMenu session={session} />
						</aside>
					</>
				)}
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			{/* Contenu de la page */}
			{children}
		</>
	);
}