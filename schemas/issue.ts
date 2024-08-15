//
// Schéma de validation pour les informations de signalement d'un bogue.
//
import * as v from "valibot";

const schema = v.object( {
	// Domaine.
	area: v.picklist( [ "account", "upload", "sharing", "other" ] ),

	// Sévérité.
	severity: v.picklist( [ "critical", "high", "medium", "low" ] ),

	// Sujet.
	subject: v.pipe( v.string(), v.minLength( 10 ), v.maxLength( 50 ) ),

	// Description.
	description: v.pipe( v.string(), v.minLength( 50 ), v.maxLength( 1000 ) )
} );

export default schema;