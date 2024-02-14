//
// Interface des attributs des partages de fichiers.
//
import type { User } from "next-auth";

export interface ShareAttributes {
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
	status: "read" | "write";
}