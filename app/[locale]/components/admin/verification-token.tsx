//
// Composant de gestion des jetons de vérification.
//
import { List, Datagrid, TextField, DateField } from "react-admin";

// Affichage des jetons.
export function TokenList()
{
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				{/* Adresse électronique */}
				<TextField source="identifier" label="Adresse électronique" />

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