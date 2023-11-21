//
// Schéma de validation pour les paramètres de l'apparence générale.
//
import { z } from "zod";

const schema = z.object( {
	// Polices de caractères.
	font: z.enum( [ "inter", "poppins", "roboto" ] ),

	// Thèmes de couleurs.
	theme: z.enum( [ "light", "dark" ] ),

	// Couleurs d'accentuation.
	color: z.enum( [
		"zinc",
		"slate",
		"stone",
		"gray",
		"neutral",
		"red",
		"rose",
		"orange",
		"green",
		"blue",
		"yellow",
		"violet"
	] )
} );

export default schema;