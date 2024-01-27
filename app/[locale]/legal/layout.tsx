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

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );

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
			<header className="flex min-h-[4rem] flex-wrap justify-center gap-2 border-b p-4 max-md:flex-col">
				<div className="align-center flex items-center gap-2 max-md:flex-col md:gap-4">
					{/* Titre du site */}
					<h1 className="text-xl font-semibold">
						<Link href="/">💾 {meta.title as string}</Link>
					</h1>

					{/* Éléments de navigation */}
					{session && (
						<Header
							theme={session.user.preferences.theme}
							source={meta.source}
						/>
					)}
				</div>

				{/* Menu utilisateur */}
				{session && <UserMenu session={session} />}
			</header>

			{children}
		</>
	);
}