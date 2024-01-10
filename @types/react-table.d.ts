// Types pour les données contextuelles de la table.
// Source : https://tanstack.com/table/v8/docs/api/core/table#meta
import type { Dispatch, SetStateAction } from "react";

declare module "@tanstack/table-core" {
	interface TableMeta {
		// Lignes en cours de chargement.
		loading: string[];

		// Fonction de mise à jour de l'état de chargement.
		setLoading: Dispatch<SetStateAction<string[]>>;
	}
}