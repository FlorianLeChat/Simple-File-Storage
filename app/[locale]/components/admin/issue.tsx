//
// Composant de gestion des signalements de bogues.
//
import { List,
	Datagrid,
	DateField,
	TextField,
	NumberField,
	ReferenceField } from "react-admin";

// Affichage des sessions.
export function IssueList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Numéro de signalement */}
				<NumberField source="id" label="Numéro" />

				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Domaine du signalement */}
				<TextField label="Domaine" source="area" />

				{/* Sévérité du signalement */}
				<TextField label="Sévérité" source="severity" />

				{/* Sujet du signalement */}
				<TextField label="Sujet" source="subject" />

				{/* Description du signalement */}
				<TextField label="Description" source="description" />

				{/* Date de création du signalement */}
				<DateField
					label="Date de création"
					source="createdAt"
					showTime
				/>
			</Datagrid>
		</List>
	);
}