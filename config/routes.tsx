//
// Déclaration des routes vers les différentes pages des paramètres.
//
import type { ReactNode } from "react";
import { Bug, Bell, User, Cctv, Files, Palette } from "lucide-react";

export const routes: {
	id: string;
	icon: ReactNode;
	href: string;
}[] = [
	{
		id: "user",
		icon: <User className="mr-2 inline" />,
		href: "/settings/user"
	},
	{
		id: "storage",
		icon: <Files className="mr-2 inline" />,
		href: "/settings/storage"
	},
	{
		id: "layout",
		icon: <Palette className="mr-2 inline" />,
		href: "/settings/layout"
	},
	{
		id: "notifications",
		icon: <Bell className="mr-2 inline" />,
		href: "/settings/notifications"
	},
	{
		id: "issue",
		icon: <Bug className="mr-2 inline" />,
		href: "/settings/issue"
	},
	{
		id: "privacy",
		icon: <Cctv className="mr-2 inline" />,
		href: "/settings/privacy"
	}
] as const;