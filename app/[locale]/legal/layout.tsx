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

const UserMenu = lazy( () => import( "../components/user-menu" ) );
const Navigation = lazy( () => import( "../components/navigation" ) );

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
			<header className="flex min-h-[4rem] flex-wrap items-center justify-center gap-y-4 border-b px-4 py-8 sm:gap-x-4 sm:py-4">
				{/* Titre du site */}
				<h1 className="text-2xl font-semibold max-sm:w-full max-sm:max-w-fit max-sm:overflow-hidden max-sm:text-ellipsis max-sm:whitespace-nowrap sm:text-xl">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

				{session && (
					<>
						{/* Navigation du site */}
						<Navigation
							theme={session.user.preferences.theme}
							source={meta.source}
						/>

						{/* Menu utilisateur */}
						<UserMenu session={session} />
					</>
				)}
			</header>

			{children}
		</>
	);
}