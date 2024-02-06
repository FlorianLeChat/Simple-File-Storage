//
// Composant de gestion des notifications.
//
import { List,
	Datagrid,
	DateField,
	NumberField,
	ReferenceField } from "react-admin";

// Affichage des notification.
export function NotificationList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Numéro de la notification */}
				<NumberField source="id" label="Numéro" />

				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Identifiant du titre de la notification */}
				<NumberField label="Titre" source="title" />

				{/* Identifiant de la description de la notification */}
				<NumberField label="Description" source="description" />

				{/* Date de création de la notification */}
				<DateField
					label="Date de création"
					source="createdAt"
					showTime
				/>
			</Datagrid>
		</List>
	);
}