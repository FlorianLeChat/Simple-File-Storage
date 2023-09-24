//
// Page du tableau de bord du site.
//

// Importation des dépendances.
import { lazy } from "react";
import { PlusCircleIcon } from "lucide-react";

// Importation des composants.
import { Button } from "../components/ui/button";

const Header = lazy( () => import( "../components/header" ) );
const UserMenu = lazy( () => import( "../components/user-menu" ) );

export default function Dashboard()
{
	return (
		<div className="hidden flex-col md:flex">
			<header className="flex h-16 items-center border-b px-4">
				{/* Titre du site */}
				<h1 className="text-xl font-semibold">
					💾 Simple File Storage
				</h1>

				{/* Éléments de navigation */}
				<Header />

				{/* Menu utilisateur */}
				<UserMenu />
			</header>

			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">
						Tableau de bord
					</h2>

					<div className="flex items-center space-x-2">
						<Button>
							<PlusCircleIcon className="mr-2 h-4 w-4" />
							Ajouter un fichier
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}