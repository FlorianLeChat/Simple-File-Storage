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
import { getTranslations, setRequestLocale } from "next-intl/server";

// Importation des fonctions utilitaires.
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { fetchMetadata } from "@/utilities/metadata";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const UserMenu = lazy( () => import( "../components/user-menu" ) );
const FadeText = lazy( () => import( "../components/ui/thirdparty/fade-text" ) );
const DataTable = lazy( () => import( "./components/data-table" ) );
const Navigation = lazy( () => import( "../components/navigation" ) );
const Notification = lazy( () => import( "../components/notification" ) );

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<Metadata>
{
	const metadata = await fetchMetadata();
	const messages = await getTranslations();

	return {
		title: `${ messages( "header.dashboard" ) } – ${ metadata.title }`
	};
}

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
			OR: [
				{
					userId: session.user.id
				},
				{
					shares: {
						some: {
							userId: session.user.id
						}
					}
				}
			]
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

	logger.debug( { source: __dirname, files }, "Files found" );

	return Promise.all(
		files.map( async ( file ) =>
		{
			const info = parse( file.name );
			const path = file.slug
				? `https://url.florian-dev.fr/${ file.slug }`
				: `/d/${ file.id }${ extension ? info.ext : "" }`;

			return {
				uuid: file.id,
				name: info.name,
				type: mime.getType( file.name ) ?? "application/octet-stream",
				path,
				slug: file.slug,
				owner: file.user,
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
				versions: file.versions.map( ( version ) => ( {
					uuid: version.id,
					size: Number( version.size ),
					date: version.createdAt,
					path: `${ path }?v=${ version.id }`,
					encrypted: version.encrypted
				} ) ),
				expiration: file.expiration
			} as FileAttributes;
		} )
	);
}

// Affichage de la page.
export default async function Page( {
	params
}: Readonly<{
	params: Promise<{ locale: string }>;
}> )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Déclaration des constantes.
	const meta = await fetchMetadata();
	const session = await auth();
	const messages = await getTranslations();

	// Vérification de la session utilisateur.
	if ( !session )
	{
		redirect( "/" );
	}

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="container mx-auto flex min-h-16 flex-wrap items-center justify-center gap-y-4 px-4 py-8 md:gap-x-4 md:py-4">
				{/* Titre du site */}
				<h1 className="text-center text-2xl font-semibold max-md:w-full max-md:truncate md:max-w-fit md:text-xl">
					<Link href="/">💾 {meta.title as string}</Link>
				</h1>

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
			</header>

			{/* Barre verticale de séparation */}
			<Separator />

			<main className="container mx-auto max-w-[1440px] p-4 md:p-8">
				{/* Titre et description de la page */}
				<FadeText
					as="h2"
					className="text-2xl font-bold tracking-tight"
					direction="left"
				>
					{messages( "header.dashboard" )}
				</FadeText>

				<FadeText
					as="p"
					delay={0.2}
					className="text-muted-foreground"
					direction="left"
				>
					{messages( "dashboard.description" )}
				</FadeText>

				{/* Barre verticale de séparation */}
				<Separator className="mb-6 mt-4 md:mb-8 md:mt-6" />

				{/* Tableau des fichiers téléversés */}
				<DataTable data={await getFiles()} />
			</main>
		</>
	);
}