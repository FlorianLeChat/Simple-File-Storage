//
// Schéma de validation pour les informations d'authentification.
//
import { z } from "zod";

const schema = z.object( {
	// Adresse électronique.
	email: z.string().min( 10 ).max( 100 ).email(),

	// Mot de passe.
	password: z.string().min( 10 ).max( 50 ).or( z.literal( "" ) ),

	// Authentification à deux facteurs.
	otp: z.string().length( 6 ).regex( /^\d+$/ ).or( z.literal( "" ) ),

	// Se souvenir de moi.
	remembered: z.boolean().optional()
} );

export default schema;