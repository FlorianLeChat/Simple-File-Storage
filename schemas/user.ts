//
// Schéma de validation pour les paramètres des informations utilisateur.
//
import * as v from "valibot";

// Taille maximale d'un avatar.
const MAX_FILE_SIZE = Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE ?? "0" );

// Types d'images acceptés pour l'avatar.
const ACCEPTED_FILE_TYPES =
	process.env.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES?.split( "," ) ?? [];

const schema = v.object( {
	// Nom d'utilisateur.
	username: v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 50 ) ),

	// Adresse électronique.
	email: v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 100 ), v.email() ),

	// Mot de passe.
	password: v.union( [
		v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 50 ) ),
		v.literal( "" )
	] ),

	// Authentification à deux facteurs.
	otp: v.union( [
		v.pipe( v.string(), v.length( 6 ), v.regex( /^\d+$/ ) ),
		v.literal( "" )
	] ),

	// Langue préférée.
	language: v.picklist( [ "en", "fr" ] ),

	// Image de l'avatar.
	//  Source : https://github.com/colinhacks/zod/issues/387
	avatar: v.union( [
		v.pipe(
			v.file(),
			v.minSize( 1 ),
			v.maxSize( MAX_FILE_SIZE ),
			v.mimeType(
				ACCEPTED_FILE_TYPES.map( ( type ) => type.trim() ) as `${ string }/${ string }`[]
			)
		),
		v.pipe(
			v.file(),
			v.size( 0 ),
			v.check( ( file ) => file.name === "undefined" ),
			v.mimeType( [ "application/octet-stream" ] )
		)
	] )
} );

export default schema;