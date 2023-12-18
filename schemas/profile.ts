//
// Schéma de validation pour les paramètres du profil utilisateur.
//
import { z } from "zod";

// Taille maximale d'un avatar.
const MAX_FILE_SIZE = 1024 * 1024 * 5;

// Types d'images acceptés pour l'avatar.
const ACCEPTED_FILE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp"
];

const schema = z.object( {
	// Adresse électronique.
	email: z.string().min( 10 ).max( 100 ).email(),

	// Image de l'avatar.
	//  Source : https://github.com/colinhacks/zod/issues/387
	avatar: z
		.custom<File>( ( file ) => file instanceof File )
		.refine(
			// Taille de l'image.
			( file ) => file.size > 0 || file.size <= MAX_FILE_SIZE,
			"zod.errors.wrong_file_size"
		)
		.refine(
			// Type de l'image.
			( file ) => ACCEPTED_FILE_TYPES.includes( file.type ),
			"zod.errors.wrong_file_type"
		)
		.or(
			// Fichier vide (par défaut).
			z.custom<File>(
				( file ) => file instanceof File
					&& file.name === "undefined"
					&& file.size === 0
					&& file.type === "application/octet-stream"
			)
		)
} );

export default schema;