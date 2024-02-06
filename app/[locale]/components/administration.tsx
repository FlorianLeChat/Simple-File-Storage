//
// Composant de la page d'administration.
//  Source : https://marmelab.com/react-admin/documentation.html
//

"use client";

// Importation des dépendances.
import { Bug,
	Save,
	User,
	Share2,
	BellRing,
	KeyRound,
	FileArchive,
	SquareStack,
	ExternalLink } from "lucide-react";
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

// Importation des composants.
import { FileList } from "./admin/file";
import { IssueList } from "./admin/issue";
import { ShareList } from "./admin/share";
import { TokenList } from "./admin/verification-token";
import { VersionList } from "./admin/version";
import { AccountList } from "./admin/account";
import { SessionList } from "./admin/session";
import { NotificationList } from "./admin/notification";
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
	// Suppression des éléments inutiles.
	document.querySelector( "video" )?.remove();
	document.querySelector( "footer" )?.remove();

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

			{/* Notifications */}
			<Resource
				icon={BellRing}
				name="notification"
				list={NotificationList}
				options={{ label: "Notifications" }}
			/>

			{/* Fichiers téléversés */}
			<Resource
				icon={FileArchive}
				name="file"
				list={FileList}
				options={{ label: "Fichiers téléversés" }}
			/>

			{/* Versions de fichiers */}
			<Resource
				icon={SquareStack}
				name="version"
				list={VersionList}
				options={{ label: "Versions de fichiers" }}
			/>

			{/* Partages de fichiers */}
			<Resource
				icon={Share2}
				name="share"
				list={ShareList}
				options={{ label: "Partages de fichiers" }}
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