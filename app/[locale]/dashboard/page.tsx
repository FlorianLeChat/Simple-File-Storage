//
// Route vers la page du tableau de bord du site.
//

// Importation des dépendances.
import mime from "mime";
import prisma from "@/utilities/prisma";
import { lazy } from "react";
import { redirect } from "next/navigation";
import { existsSync } from "fs";
import { join, parse } from "path";
import type { Metadata } from "next";
import { mkdir, readdir, stat } from "fs/promises";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "../layout";

// Importation des composants.
import { Separator } from "../components/ui/separator";
import { type File, columns } from "./components/columns";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const DataTable = lazy( () => import( "./components/data-table" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Tableau de bord – Simple File Storage"
};

// Récupération des fichiers depuis le système de fichiers.
async function getFiles(): Promise<File[]>
{
	// On vérifie d'abord si la session utilisateur est valide.
	const session = await auth();

	if ( !session )
	{
		return [];
	}

	// On créé ensuite le dossier de stockage si celui-ci n'existe pas.
	const folderPath = join( process.cwd(), "public/storage" );

	await mkdir( folderPath, { recursive: true } );

	// On vérifie après l'existence du dossier de l'utilisateur.
	const userFolder = join( folderPath, session.user.id );

	if ( !existsSync( userFolder ) )
	{
		return [];
	}

	// On récupère enfin tous les fichiers de l'utilisateur
	//  à travers une promesse pour les opérations de la base
	//  de données.
	return Promise.all(
		( await readdir( userFolder ) ).map( async ( file, index ) =>
		{
			// On retourne enfin les propriétés de chaque fichier
			//  associé avec leur nom d'origine.
			const stats = await stat( join( userFolder, file ) );
			const result = await prisma.file.findUnique( {
				where: {
					fileId: parse( file ).name
				}
			} );

			return {
				id: index,
				name: parse( result?.name ?? file ).name,
				type: mime.getType( file ) ?? "application/octet-stream",
				size: stats.size,
				date: stats.birthtime.toISOString(),
				status: result?.status ?? "public"
			} as File;
		} )
	);
}

// Affichage de la page.
export default async function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Vérification de la session utilisateur.
	const session = await auth();

	if ( !session )
	{
		redirect( "/" );
	}

	// Récupération de l'avatar utilisateur.
	if ( !session.user.image )
	{
		const avatar = await readdir( join( process.cwd(), "public/avatar" ) );

		if ( avatar.length > 0 )
		{
			session.user.image = `/avatars/${ avatar[ 0 ] }`;
		}
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="flex min-h-[4rem] flex-wrap justify-center gap-2 border-b p-4 max-md:flex-col">
				<div className="align-center flex items-center gap-2 max-md:flex-col md:gap-4">
					{/* Titre du site */}
					<h1 className="text-xl font-semibold">
						💾 Simple File Storage
					</h1>

					{/* Éléments de navigation */}
					<Header source={( await generateMetadata() ).source} />
				</div>

				{/* Menu utilisateur */}
				<UserMenu session={session} />
			</header>

			<main className="p-4 md:p-10">
				{/* Titre et description de la page */}
				<h2 className="text-2xl font-bold tracking-tight">
					Tableau de bord
				</h2>

				<p className="text-muted-foreground">
					Téléverser et partager vos fichiers à partir de votre
					ordinateur.
				</p>

				{/* Barre verticale de séparation */}
				<Separator className="my-6" />

				{/* Tableau des fichiers téléversés */}
				<DataTable columns={columns} data={await getFiles()} />
			</main>
		</>
	);
}