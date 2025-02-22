//
// Interface des attributs des versions de fichiers.
//
export interface VersionAttributes
{
	// Identifiant unique de la version.
	uuid: string;

	// Poids de la version en octets.
	size: number;

	// Date de création de la version.
	date: Date;

	// Chemin d'accès à la version.
	path: string;

	// État de chiffrement de la version.
	encrypted: boolean;
}