//
// Schéma de validation pour les paramètres du compte utilisateur.
//
import { z } from "zod";

const schema = z.object( {
	// Nom d'utilisateur.
	username: z.string().min( 10 ).max( 50 ),

	// Langue préférée.
	language: z.enum( [ "en", "fr" ] ),

	// Mot de passe.
	password: z.string().min( 10 ).max( 100 ).or( z.literal( "" ) )
} );

export default schema;