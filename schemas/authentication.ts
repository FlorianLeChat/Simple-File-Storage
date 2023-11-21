//
// Schéma de validation pour les informations d'authentification.
//
import { z } from "zod";

// Validation requise pour le mot de passe (authentification par courriel).
const requiredPassword = z.string().min( 10 ).max( 60 );
// Validation optionnelle pour le mot de passe (authentification par mot de passe).
const optionalPassword = z.string().optional().optional();

const schema = z.object( {
	// Adresse électronique.
	email: z.string().min( 10 ).max( 100 ).email(),

	// Mot de passe (requis ou optionnel, optionnel par défaut).
	password: optionalPassword,

	// Se souvenir de moi.
	remembered: z.boolean().optional()
} );

export { schema, requiredPassword, optionalPassword };