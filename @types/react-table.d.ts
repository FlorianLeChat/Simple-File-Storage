// Types pour les données contextuelles de la table.
// Source : https://tanstack.com/table/v8/docs/api/core/table#meta
import type { FileAttributes } from "@/interfaces/File";
import type { Dispatch, SetStateAction } from "react";

declare module "@tanstack/table-core" {
	interface TableMeta {
		// Fichiers affichés dans le tableau.
		files: FileAttributes[];

		// Lignes en cours de chargement.
		loading: boolean;

		// Fonction de mise à jour des fichiers.
		setFiles: Dispatch<SetStateAction<FileAttributes[]>>;

		// Fonction de mise à jour de l'état de chargement.
		setLoading: Dispatch<SetStateAction<boolean>>;
	}
}