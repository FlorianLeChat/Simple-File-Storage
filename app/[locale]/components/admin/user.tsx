//
// Composant de gestion des comptes utilisateurs.
//
import { Edit,
	List,
	Create,
	required,
	Datagrid,
	UrlField,
	TextField,
	DateField,
	TextInput,
	SimpleForm,
	SelectInput,
	PasswordInput } from "react-admin";

// Création d'un compte.
export function UserCreate()
{
	return (
		<Create>
			<SimpleForm>
				{/* Nom d'utilisateur */}
				<TextInput
					name="name"
					label="Nom d'utilisateur"
					source="name"
					validate={required()}
					fullWidth
				/>

				{/* Adresse électronique */}
				<TextInput
					name="email"
					label="Adresse électronique"
					source="email"
					validate={required()}
					fullWidth
				/>

				{/* Mot de passe */}
				<PasswordInput
					name="password"
					label="Mot de passe"
					source="password"
					validate={required()}
					fullWidth
				/>
			</SimpleForm>
		</Create>
	);
}

// Modification d'un compte.
export function UserEdit()
{
	return (
		<Edit>
			<SimpleForm>
				{/* Nom d'utilisateur */}
				<TextInput
					name="name"
					label="Nom d'utilisateur"
					source="name"
					validate={required()}
					fullWidth
				/>

				{/* Adresse électronique */}
				<TextInput
					name="email"
					label="Adresse électronique"
					source="email"
					validate={required()}
					fullWidth
				/>

				{/* Mot de passe */}
				<PasswordInput
					name="password"
					label="Mot de passe"
					source="password"
					validate={required()}
					fullWidth
				/>

				{/* Notifications */}
				<SelectInput
					name="notifications"
					label="Notifications"
					source="notifications"
					choices={[
						{ id: "off", name: "Désactivées" },
						{ id: "necessary", name: "Nécessaires" },
						{
							id: "necessary+mail",
							name: "Nécessaires avec courriel"
						},
						{ id: "all", name: "Toutes" },
						{ id: "all+mail", name: "Toutes avec courriel" }
					]}
					validate={required()}
					fullWidth
				/>

				{/* Lien de l'avatar */}
				<TextInput
					name="image"
					label="Lien de l'avatar"
					source="image"
					validate={required()}
					fullWidth
				/>

				{/* Rôle */}
				<SelectInput
					name="role"
					label="Rôle"
					source="role"
					choices={[
						{ id: "user", name: "Utilisateur" },
						{ id: "admin", name: "Administrateur" }
					]}
					validate={required()}
					fullWidth
				/>
			</SimpleForm>
		</Edit>
	);
}

// Affichage des comptes.
export function UserList()
{
	return (
		<List>
			<Datagrid rowClick="edit">
				{/* Nom d'utilisateur */}
				<TextField source="name" label="Nom d'utilisateur" />

				{/* Adresse électronique */}
				<TextField source="email" label="Adresse électronique" />

				{/* Notifications */}
				<TextField source="notifications" label="Notifications" />

				{/* Date de création */}
				<DateField
					label="Date de vérification"
					source="emailVerified"
					showTime
				/>

				{/* Lien de l'avatar */}
				<UrlField source="image" label="Lien de l'avatar" />

				{/* Rôle */}
				<TextField source="role" label="Rôle" />
			</Datagrid>
		</List>
	);
}