//
// Schéma de validation pour les paramètres de notification.
//
import { z } from "zod";

const schema = z.object( {
	// Notifications par courriel.
	push: z.boolean(),

	// Niveau de notification.
	level: z.enum( [ "all", "necessary", "off" ] )
} );

export default schema;