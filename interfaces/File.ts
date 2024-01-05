//
// Interface des attributs des fichiers utilisateurs.
//
export interface FileAttributes {
	// Identifiant unique du fichier.
	id: number;

	// Nom original du fichier.
	name: string;

	// Type MIME du fichier.
	type: string;

	// Taille du fichier en octets.
	size: number;

	// Date de création du fichier.
	date: string;

	// Statut de partage du fichier.
	status: "public" | "private" | "shared";
}