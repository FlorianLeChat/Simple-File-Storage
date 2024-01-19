//
// Schéma de validation pour les paramètres des informations utilisateur.
//
import { z } from "zod";

// Taille maximale d'un avatar.
const MAX_FILE_SIZE = Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE ?? "0" );

// Types d'images acceptés pour l'avatar.
const ACCEPTED_FILE_TYPES =
	process.env.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES?.split( "," ) ?? [];

const schema = z.object( {
	// Nom d'utilisateur.
	username: z.string().min( 10 ).max( 50 ),

	// Adresse électronique.
	email: z.string().min( 10 ).max( 100 ).email(),

	// Mot de passe.
	password: z.string().min( 10 ).max( 100 ).or( z.literal( "" ) ),

	// Langue préférée.
	language: z.enum( [ "en", "fr" ] ),

	// Image de l'avatar.
	//  Source : https://github.com/colinhacks/zod/issues/387
	avatar: z
		.custom<File>( ( file ) => file instanceof File )
		.refine(
			// Taille de l'image.
			( file ) => file.size > 0 && file.size <= MAX_FILE_SIZE,
			"wrong_file_size"
		)
		.refine(
			// Type de l'image.
			( file ) => ACCEPTED_FILE_TYPES.some( ( type ) =>
			{
				const acceptedType = type.trim().slice( 0, -1 );
				return file.type.startsWith( acceptedType );
			} ),
			"wrong_file_type"
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