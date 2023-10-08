//
// Route vers la page du tableau de bord du site.
//

// Importation des dépendances.
import { lazy } from "react";
import type { Metadata } from "next";
import { type File, columns } from "./components/columns";

// Importation des composants.
import { Separator } from "../components/ui/separator";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const DataTable = lazy( () => import( "./components/data-table" ) );

// Déclaration des propriétés de la page.
export const metadata: Metadata = {
	title: "Tableau de bord – Simple File Storage"
};

// Récupération des données depuis l'API.
async function getData(): Promise<File[]>
{
	return [
		{
			id: "728ed52f",
			name: "Document",
			type: "document/pdf",
			size: 11450005.2,
			date: "2021-09-01",
			status: "public"
		},
		{
			id: "728ed53f",
			name: "Secret",
			type: "image/gif",
			size: 404150.6,
			date: "2023-02-01",
			status: "public"
		},
		{
			id: "728ed54f",
			name: "Application",
			type: "application/exe",
			size: 334156500.4,
			date: "2023-04-06",
			status: "private"
		}
	];
}

// Affichage de la page.
export default async function Dashboard()
{
	// Déclaration des constantes.
	const data = await getData();

	// Affichage du rendu HTML de la page.
	return (
		<>
			<header className="flex min-h-[4rem] justify-center gap-4 border-b sm:px-4">
				<div className="align-center flex flex-col items-center gap-2 pb-3 pt-4 sm:flex-row sm:gap-4 sm:py-0">
					{/* Titre du site */}
					<h1 className="text-xl font-semibold">
						💾 Simple File Storage
					</h1>

					{/* Éléments de navigation */}
					<Header />
				</div>

				{/* Menu utilisateur */}
				<UserMenu />
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
				<DataTable columns={columns} data={data} />
			</main>
		</>
	);
}