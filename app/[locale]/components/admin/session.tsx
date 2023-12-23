//
// Composant de gestion des sessions utilisateurs.
//
import { List,
	Datagrid,
	DateField,
	TextField,
	ReferenceField } from "react-admin";

// Affichage des sessions.
export function SessionList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Jeton de session */}
				<TextField source="sessionToken" label="Jeton de session" />

				{/* Relation avec l'utilisateur */}
				<ReferenceField
					label="Utilisateur"
					source="userId"
					reference="user"
				/>

				{/* Date d'expiration */}
				<DateField
					label="Date d'expiration"
					source="expires"
					showTime
				/>
			</Datagrid>
		</List>
	);
}