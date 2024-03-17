//
// Déclaration des routes vers les différentes pages des paramètres.
//
import { Bug, Bell, User, Cctv, Files, Palette } from "lucide-react";

export const routes: {
	title: JSX.Element;
	href: string;
	description: string;
}[] = [
	{
		title: (
			<>
				<User className="mr-2 inline" />
				Utilisateur
			</>
		),
		href: "/settings/user",
		description:
			"Gestion des informations de votre profil et de votre compte."
	},
	{
		title: (
			<>
				<Files className="mr-2 inline" />
				Stockage
			</>
		),
		href: "/settings/storage",
		description:
			"Personnalisation du mécanisme de téléversement des fichiers."
	},
	{
		title: (
			<>
				<Palette className="mr-2 inline" />
				Apparence
			</>
		),
		href: "/settings/layout",
		description: "Personnalisation de l'apparence du site Internet."
	},
	{
		title: (
			<>
				<Bell className="mr-2 inline" />
				Notifications
			</>
		),
		href: "/settings/notifications",
		description:
			"Gestion des notifications reçues par courriel ou sur le site Internet."
	},
	{
		title: (
			<>
				<Bug className="mr-2 inline" />
				Bogues
			</>
		),
		href: "/settings/issue",
		description: "Signalement d'un bogue rencontré sur le site Internet."
	},
	{
		title: (
			<>
				<Cctv className="mr-2 inline" />
				Confidentialité
			</>
		),
		href: "/settings/privacy",
		description:
			"Gestion des données personnelles collectées par le site Internet."
	}
] as const;