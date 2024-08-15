//
// Schéma de validation pour les paramètres de l'apparence générale.
//
import * as v from "valibot";

const schema = v.object( {
	// Polices de caractères.
	font: v.picklist( [ "inter", "poppins", "roboto" ] ),

	// Thèmes de couleurs.
	theme: v.picklist( [ "light", "dark" ] ),

	// Couleurs d'accentuation.
	color: v.picklist( [
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