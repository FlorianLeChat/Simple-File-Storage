//
// Schéma de validation pour le téléversement de fichiers.
//
import { z } from "zod";

// Taille maximale d'un fichier.
const MAX_FILE_SIZE = 1024 * 1024 * 5;

// Types de fichiers acceptés.
const ACCEPTED_FILE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp"
];

const schema = z.object( {
	// Fichier(s) à téléverser.
	//  Source : https://github.com/colinhacks/zod/issues/387
	upload: z
		.array( z.custom<File>() )
		.refine( ( files ) => files.every( ( file ) => file instanceof File ), {
			message: "zod.errors.wrong_file_object"
		} )
		.refine(
			( files ) => files.every( ( file ) => file.size <= MAX_FILE_SIZE ),
			"zod.errors.wrong_file_size"
		)
		.refine(
			( files ) => files.every( ( file ) => ACCEPTED_FILE_TYPES.includes( file.type ) ),
			"zod.errors.wrong_file_type"
		)
} );

export default schema;