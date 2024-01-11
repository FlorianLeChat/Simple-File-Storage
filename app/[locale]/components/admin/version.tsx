//
// Composant de gestion des versions de fichiers.
//
import { List,
	Datagrid,
	DateField,
	TextField,
	ReferenceField } from "react-admin";

// Affichage des versions.
export function VersionList()
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

				{/* Hachage de la version */}
				<TextField label="Hachage" source="hash" />

				{/* Date de création de la version */}
				<DateField
					label="Date de création"
					source="createdAt"
					showTime
				/>
			</Datagrid>
		</List>
	);
}