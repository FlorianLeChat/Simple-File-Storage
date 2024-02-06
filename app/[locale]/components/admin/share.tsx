//
// Composant de gestion des partages de fichiers.
//
import { List, Datagrid, TextField, ReferenceField } from "react-admin";

// Affichage des partages.
export function ShareList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Identifiant de la version */}
				<TextField source="id" label="Numéro" />

				{/* Relation avec le fichier */}
				<ReferenceField
					label="Fichier"
					source="fileId"
					reference="file"
				/>

				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Statut du partage */}
				<TextField label="Statut" source="status" />
			</Datagrid>
		</List>
	);
}