//
// Schéma de validation pour le téléversement de fichiers.
//
import * as v from "valibot";

// Types de fichiers acceptés.
const ACCEPTED_FILE_TYPES =
	process.env.NEXT_PUBLIC_ACCEPTED_FILE_TYPES?.split( "," ) ?? [];

const schema = v.object( {
	// Fichier(s) à téléverser.
	//  Source : https://github.com/colinhacks/zod/issues/387
	upload: v.pipe(
		v.array( v.custom<File>( ( value ) => value instanceof File ) ),
		v.check(
			( files ) => files.every( ( file ) => file instanceof File ),
			"custom.wrong_file_object"
		),
		v.check(
			( files ) => files.every( ( file ) => file.size > 0 ),
			"custom.wrong_file_size"
		),
		v.check(
			( files ) => files.every(
				( file ) => file.name.length > 0 && file.name.length <= 100
			),
			"custom.wrong_file_name"
		),
		v.check(
			( files ) => files.every( ( file ) => ACCEPTED_FILE_TYPES.some( ( type ) =>
			{
				const acceptedType = type.trim().slice( 0, -1 );
				return file.type.startsWith( acceptedType );
			} ) ),
			"custom.wrong_file_type"
		)
	),

	// Compression des images.
	compression: v.boolean(),

	// Chiffrement renforcé.
	encryption: v.boolean(),

	// Date d'expiration du fichier.
	expiration: v.union( [ v.pipe( v.string(), v.isoDateTime() ), v.literal( "" ) ] )
} );

export default schema;