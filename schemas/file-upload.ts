//
// Schéma de validation pour le téléversement de fichiers.
//
import { z } from "zod";

const schema = z.object( {
	// Fichier à téléverser.
	upload: z.any()
} );

export default schema;