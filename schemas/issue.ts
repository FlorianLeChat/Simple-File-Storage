//
// Schéma de validation pour les informations de signalement d'un bogue.
//
import { z } from "zod";

const schema = z.object( {
	// Domaine.
	area: z.enum( [ "account", "upload", "sharing", "other" ] ),

	// Sévérité.
	severity: z.enum( [ "critical", "high", "medium", "low" ] ),

	// Sujet.
	subject: z.string().min( 10 ).max( 50 ),

	// Description.
	description: z.string().min( 50 ).max( 1000 )
} );

export default schema;