//
// Composant de la page d'administration.
//  Source : https://marmelab.com/react-admin/documentation.html
//

"use client";

// Importation des dépendances.
import frenchMessages from "ra-language-french";
import englishMessages from "ra-language-english";
import { dataProvider } from "ra-data-simple-prisma";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { Title,
	Admin,
	Layout,
	AppBar,
	Resource,
	defaultTheme,
	LocalesMenuButton,
	ToggleThemeButton,
	RefreshIconButton,
	resolveBrowserLocale,
	withLifecycleCallbacks } from "react-admin";
import type { CoreLayoutProps } from "ra-core";
import { Bug, ExternalLink, KeyRound, Save, User } from "lucide-react";

// Importation des composants.
import { IssueList } from "./admin/issue";
import { TokenList } from "./admin/verification-token";
import { AccountList } from "./admin/account";
import { SessionList } from "./admin/session";
import { UserCreate, UserEdit, UserList } from "./admin/user";

// Basculement entre les traductions.
const i18nProvider = polyglotI18nProvider(
	( locale ) => ( locale === "fr" ? frenchMessages : englishMessages ),
	resolveBrowserLocale(),
	[
		// https://marmelab.com/react-admin/TranslationLocales.html
		{ locale: "en", name: "English" },
		{ locale: "fr", name: "Français" }
	]
);

// Personnalisation de l'en-tête.
//  Source : https://marmelab.com/react-admin/ToggleThemeButton.html
function CustomHeader()
{
	return (
		<AppBar
			toolbar={(
				<>
					{/* Changement de langue */}
					<LocalesMenuButton />

					{/* Changement de thème */}
					<ToggleThemeButton />

					{/* Rafraîchissement des données */}
					<RefreshIconButton />
				</>
			)}
		/>
	);
}

function CustomLayout( props: CoreLayoutProps )
{
	return <Layout {...props} appBar={CustomHeader} />;
}

// Modification des fonctions de rappel du fournisseur de données.
//  Source : https://marmelab.com/react-admin/withLifecycleCallbacks.html
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
			// Signalements de bogues.
			resource: "issue",
			beforeGetList: async ( data ) =>
			{
				data.sort.field = "issueId";

				return data;
			},
			afterRead: ( data ) =>
			{
				data.id = data.issueId;

				return data;
			}
		},
		{
			// Jetons de vérification.
			resource: "verificationToken",
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

export default function Administration()
{
	// Affichage du rendu HTML du composant.
	return (
		<Admin
			theme={defaultTheme}
			layout={CustomLayout}
			darkTheme={{ palette: { mode: "dark" } }}
			i18nProvider={i18nProvider}
			dataProvider={customDataProvider}
		>
			{/* Titre par défaut */}
			<Title title="Administration" />

			{/* Comptes utilisateurs */}
			<Resource
				name="user"
				icon={User}
				list={UserList}
				edit={UserEdit}
				create={UserCreate}
				options={{ label: "Comptes utilisateurs" }}
			/>

			{/* Comptes OAuth */}
			<Resource
				icon={ExternalLink}
				name="account"
				list={AccountList}
				options={{ label: "Comptes OAuth" }}
			/>

			{/* Sessions */}
			<Resource
				icon={Save}
				name="session"
				list={SessionList}
				options={{ label: "Sessions utilisateurs" }}
			/>

			{/* Signalements de bogues */}
			<Resource
				icon={Bug}
				name="issue"
				list={IssueList}
				options={{ label: "Signalements de bogues" }}
			/>

			{/* Jetons de vérification */}
			<Resource
				icon={KeyRound}
				name="verificationToken"
				list={TokenList}
				options={{ label: "Jetons de vérification" }}
			/>
		</Admin>
	);
}