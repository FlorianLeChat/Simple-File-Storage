// @ts-check

/**
 * @type {import("next").NextConfig}
 */
module.exports = {
	basePath: "",
	poweredByHeader: false,
	async redirects()
	{
		return [
			{
				// Redirection de la page d'accueil des paramètres
				//  vers l'onglet par défaut du profil utilisateur.
				source: "/settings",
				permanent: true,
				destination: "/settings/profile"
			}
		];
	}
};