//
// Interface des attributs des fichiers utilisateurs.
//
export interface FileAttributes {
	// Identifiant unique du fichier.
	uuid: string;

	// Nom original du fichier.
	name: string;

	// Type MIME du fichier.
	type: string;

	// Taille du fichier en octets.
	size: number;

	// Date de création du fichier.
	date: string;

	// Chemin d'accès au fichier.
	path: string;

	// Statut de partage du fichier.
	status: "public" | "private" | "shared";

	// Liste des versions du fichier.
	versions?: {
		// Identifiant unique de la version.
		id: string;

		// Poids de la version en octets.
		size: string;

		// Date de création de la version.
		date: string;
	}[];
}