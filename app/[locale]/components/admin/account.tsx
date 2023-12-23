//
// Composant de gestion des comptes OAuth.
//
import { List, Datagrid, TextField, ReferenceField } from "react-admin";

// Affichage des comptes.
export function AccountList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Type de compte */}
				<TextField source="type" label="Type de compte" />

				{/* Nom du fournisseur */}
				<TextField source="provider" label="Nom du fournisseur" />

				{/* Identifiant unique du compte */}
				<TextField
					label="Identifiant unique"
					source="providerAccountId"
				/>
			</Datagrid>
		</List>
	);
}