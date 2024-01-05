//
// Composant de gestion des données de stockage de l'utilisateur.
//

"use client";

import type { FileAttributes } from "@/interfaces/File";
import { createContext, type Dispatch, type SetStateAction } from "react";

export const StorageContext = createContext<{
	files: FileAttributes[];
	setFiles: Dispatch<SetStateAction<FileAttributes[]>>;
}>( {
	// Liste des fichiers utilisateurs.
	files: [],

	// Définition de la liste des fichiers utilisateurs.
	setFiles: () =>
	{}
} );