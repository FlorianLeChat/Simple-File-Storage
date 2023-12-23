//
// Composant de la page d'administration.
//

"use client";

// Importation des dépendances.
import { dataProvider } from "ra-data-simple-prisma";
import { Admin, Resource, withLifecycleCallbacks } from "react-admin";

// Importation des composants.
import { TokenList } from "./admin/verification-token";
import { AccountList } from "./admin/account";
import { SessionList } from "./admin/session";
import { UserCreate, UserEdit, UserList } from "./admin/user";

// Déclaration du fournisseur de données personnalisé.
export const customDataProvider = withLifecycleCallbacks(
	dataProvider( "/api/admin" ),
	[
		{
			// Comptes OAuth.
			resource: "account",
			beforeGetList: async ( data ) =>
			{
				data.sort.field = "userId";

				return data;
			},
			afterRead: ( data ) =>
			{
				data.id = data.userId;

				return data;
			}
		},
		{
			// Sessions utilisateurs.
			resource: "session",
			beforeGetList: async ( data ) =>
			{
				data.sort.field = "sessionToken";

				return data;
			},
			afterRead: ( data ) =>
			{
				data.id = data.sessionToken;

				return data;
			}
		},
		{
			// Jetons de verificationToken.
			resource: "session",
			beforeGetList: async ( data ) =>
			{
				data.sort.field = "identifier";

				return data;
			},
			afterRead: ( data ) =>
			{
				data.id = data.identifier;

				return data;
			}
		}
	]
);

// Affichage de la page.
export default function Administration()
{
	return (
		<Admin dataProvider={customDataProvider}>
			{/* Comptes utilisateurs */}
			<Resource
				name="user"
				list={UserList}
				edit={UserEdit}
				create={UserCreate}
				options={{ label: "Comptes utilisateurs" }}
			/>

			{/* Comptes OAuth */}
			<Resource
				name="account"
				list={AccountList}
				options={{ label: "Comptes OAuth" }}
			/>

			{/* Sessions */}
			<Resource
				name="session"
				list={SessionList}
				options={{ label: "Sessions utilisateurs" }}
			/>

			{/* Jetons de vérification */}
			<Resource
				name="verificationToken"
				list={TokenList}
				options={{ label: "Jetons de vérification" }}
			/>
		</Admin>
	);
}