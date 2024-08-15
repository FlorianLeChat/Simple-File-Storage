//
// Schéma de validation pour les paramètres de notification.
//
import * as v from "valibot";

const schema = v.object( {
	// Notifications par courriel.
	push: v.boolean(),

	// Niveau de notification.
	level: v.picklist( [ "all", "necessary", "off" ] )
} );

export default schema;