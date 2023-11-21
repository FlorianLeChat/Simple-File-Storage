//
// Schéma de validation pour les paramètres du profil utilisateur.
//
import { z } from "zod";

const schema = z.object( {
	// Pseudonyme unique.
	username: z.string().min( 10 ).max( 50 ),

	// Adresse électronique.
	email: z.string().min( 10 ).max( 100 ).email(),

	// URL de l'avatar.
	avatar: z.string().url().optional()
} );

export default schema;