//
// Schéma de validation pour les informations d'authentification.
//
import * as v from "valibot";

const schema = v.object( {
	// Adresse électronique.
	email: v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 100 ), v.email() ),

	// Mot de passe.
	password: v.union( [
		v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 50 ) ),
		v.literal( "" )
	] )
} );

export default schema;