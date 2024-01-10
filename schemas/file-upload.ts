//
// Schéma de validation pour le téléversement de fichiers.
//
import { z } from "zod";

// Types de fichiers acceptés.
const ACCEPTED_FILE_TYPES =
	process.env.NEXT_PUBLIC_ACCEPTED_FILE_TYPES?.split( "," ) ?? [];

const schema = z.object( {
	// Fichier(s) à téléverser.
	//  Source : https://github.com/colinhacks/zod/issues/387
	upload: z
		.array( z.custom<File>() )
		.refine(
			( files ) => files.every( ( file ) => file instanceof File ),
			"wrong_file_object"
		)
		.refine(
			( files ) => files.every( ( file ) => file.size > 0 ),
			"wrong_file_size"
		)
		.refine(
			( files ) => files.every(
				( file ) => file.name.length > 0 && file.name.length <= 100
			),
			"wrong_file_name"
		)
		.refine(
			( files ) => files.every( ( file ) => ACCEPTED_FILE_TYPES.some( ( type ) =>
			{
				const acceptedType = type.trim().slice( 0, -1 );
				return file.type.startsWith( acceptedType );
			} ) ),
			"wrong_file_type"
		)
} );

export default schema;