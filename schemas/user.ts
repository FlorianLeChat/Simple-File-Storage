//
// Schéma de validation pour les paramètres des informations utilisateur.
//
import * as v from "valibot";

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

	// Langue préférée.
	language: v.picklist( [ "en", "fr" ] )
} );

export default schema;