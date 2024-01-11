//
// Composant de gestion des fichiers téléversés.
//
import { List, Datagrid, TextField, ReferenceField } from "react-admin";

// Affichage des fichiers.
export function FileList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Identifiant du fichier */}
				<TextField source="id" label="Identifiant" />

				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Nom du fichier */}
				<TextField label="Nom" source="name" />

				{/* Statut du fichier */}
				<TextField label="Partage" source="status" />
			</Datagrid>
		</List>
	);
}