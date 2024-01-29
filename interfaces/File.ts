//
// Interface des attributs des fichiers utilisateurs.
//
import type { User } from "next-auth";

export interface FileAttributes {
	// Identifiant unique du fichier.
	uuid: string;

	// Nom original du fichier.
	name: string;

	// Type MIME du fichier.
	type: string;

	// Chemin d'accès au fichier.
	path: string;

	// Statut de partage du fichier.
	status: "public" | "private" | "shared";

	// Partage du fichier.
	shares: {
		// Utilisateur en partage.
		user: {
			// Identifiant unique.
			uuid: User["id"];

			// Nom d'affichage.
			name: User["name"];

			// Adresse électronique.
			email: User["email"];

			// Image de profil.
			image: User["image"];
		};

		// Type de partage du fichier avec l'utilisateur.
		status: "read" | "write" | "admin";
	}[];

	// État de chiffrement du fichier.
	encrypted: boolean;

	// Liste des versions du fichier.
	versions: {
		// Identifiant unique de la version.
		uuid: string;

		// Poids de la version en octets.
		size: number;

		// Date de création de la version.
		date: Date;

		// Chemin d'accès à la version.
		path: string;
	}[];
}