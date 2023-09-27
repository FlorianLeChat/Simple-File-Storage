//
// Page du tableau de bord du site.
//

// Importation des dépendances.
import { lazy } from "react";
import { PlusCircleIcon } from "lucide-react";
import { type File, columns } from "./components/columns";

// Importation des composants.
import { Button } from "../components/ui/button";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );
const DataTable = lazy( () => import( "./components/data-table" ) );

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
			<header className="flex h-16 items-center border-b px-4">
				{/* Titre du site */}
				<h1 className="mr-4 text-xl font-semibold">
					💾 Simple File Storage
				</h1>

				{/* Éléments de navigation */}
				<Header />

				{/* Menu utilisateur */}
				<UserMenu />
			</header>

			<main className="flex-1 space-y-4 p-8 pt-6">
				{/* En-tête de la page */}
				<section className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">
						Tableau de bord
					</h2>

					<Button className="flex items-center space-x-2">
						<PlusCircleIcon className="mr-2 h-4 w-4" />
						Ajouter un fichier
					</Button>
				</section>

				{/* Contenu général de la page */}
				<div className="container mx-auto py-10">
					<DataTable columns={columns} data={data} />
				</div>
			</main>
		</>
	);
}