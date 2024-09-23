//
// Interface des attributs des fichiers utilisateurs.
//
import type { User } from "next-auth";
import type { ShareAttributes } from "./Share";
import type { VersionAttributes } from "./Version";

export interface FileAttributes {
	// Identifiant unique du fichier.
	uuid: string;

	// Nom original du fichier.
	name: string;

	// Type MIME du fichier.
	type: string;

	// Chemin d'accès au fichier.
	path: string;

	// Propriétaire du fichier.
	owner: User;

	// Statut de partage du fichier.
	status: "public" | "private" | "shared";

	// Partage du fichier.
	shares: ShareAttributes[];

	// Liste des versions du fichier.
	versions: VersionAttributes[];

	// Date d'expiration du fichier.
	expiration?: Date;
}