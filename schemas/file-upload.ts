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
	upload: v.array(
		v.pipe(
			v.file(),
			v.minSize( 1 ),
			v.check(
				( file ) => file.name.length > 0 && file.name.length <= 100,
				"custom.wrong_file_name"
			),
			v.check(
				( file ) => ACCEPTED_FILE_TYPES.some( ( type ) =>
				{
					const acceptedType = type.trim().slice( 0, -1 );
					return file.type.startsWith( acceptedType );
				} ),
				"custom.wrong_file_type"
			)
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