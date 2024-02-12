//
// Route vers la page du tableau de bord du site.
//

// Importation des dépendances.
import mime from "mime";
import Link from "next/link";
import prisma from "@/utilities/prisma";
import { lazy } from "react";
import { parse } from "path";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { FileAttributes } from "@/interfaces/File";
import { unstable_setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { generateMetadata } from "../layout";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const DataTable = lazy( () => import( "./components/data-table" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Tableau de bord – Simple File Storage"
};

// Récupération des fichiers depuis le système de fichiers.
async function getFiles(): Promise<FileAttributes[]>
{
	// On vérifie d'abord si la session utilisateur est valide.
	const session = await auth();

	if ( !session )
	{
		return [];
	}

	// On récupère ensuite tous les fichiers de l'utilisateur
	//  enregistrés dans la base de données.
	const files = await prisma.file.findMany( {
		where: {
			userId: session.user.id
		},
		include: {
			user: true,
			shares: {
				include: {
					user: true
				}
			},
			versions: {
				orderBy: {
					createdAt: "desc"
				}
			}
		}
	} );

	// On retourne enfin une promesse contenant la liste des
	//  des fichiers de l'utilisateur.
	const { extension } = session.user.preferences;

	return Promise.all(
		files.map( async ( file ) =>
		{
			const info = parse( file.name );
			const path = `${ process.env.__NEXT_ROUTER_BASEPATH }/d/${ file.id }${
				extension ? info.ext : ""
			}`;

			return {
				uuid: file.id,
				name: info.name,
				type: mime.getType( file.name ) ?? "application/octet-stream",
				path,
				status: file.shares.length > 0 ? "shared" : file.status,
				shares: file.shares.map( ( share ) => ( {
					user: {
						uuid: share.userId,
						name: share.user.name,
						email: share.user.email,
						image: share.user.image
					},
					status: share.status
				} ) ),
				encrypted: file.encrypted,
				versions: file.versions.map( ( version ) => ( {
					uuid: version.id,
					size: Number( version.size ),
					date: version.createdAt,
					path: `${ path }?v=${ version.id }`
				} ) )
			} as FileAttributes;
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

	// Déclaration des constantes.
	const meta = await generateMetadata();
	const session = await auth();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

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
					<Header
						theme={session.user.preferences.theme}
						source={meta.source}
					/>
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
				<DataTable data={await getFiles()} />
			</main>
		</>
	);
}