//
// Permet de récupérer les messages d'erreurs liés à l'authentification de Next Auth.
//  Source : https://authjs.dev/guides/basics/pages#sign-in-page
//
export function getAuthErrorMessage( error: string )
{
	switch ( error )
	{
		case "OAuthSignin":
			return "Erreur lors de la connexion avec ce fournisseur d'authentification externe.";

		case "OAuthCallback" || "Callback":
			return "Erreur lors de la lecture de la réponse du fournisseur d'authentification externe.";

		case "OAuthCreateAccount" || "EmailCreateAccount":
			return "Erreur lors de la création de votre compte utilisateur dans la base de données.";

		case "OAuthAccountNotLinked":
			return "Cette adresse électronique est déjà associée à un autre compte utilisateur.";

		case "EmailSignin":
			return "Erreur lors de l'envoi du courriel de vérification à l'adresse électronique fournie.";

		case "CredentialsSignin":
			return "Erreur lors de l'authentification avec les informations de connexion fournies.";

		case "SessionRequired":
			return "Cette page nécessite une session utilisateur pour fonctionner.";

		default:
			return "Une erreur interne est survenue lors de l'authentification.";
	}
}

//
// Permet de récupérer les messages d'erreurs génériques de Next Auth.
//  Source : https://authjs.dev/guides/basics/pages#error-page
//
export function getGenericErrorMessage( error: string ): string | undefined
{
	switch ( error )
	{
		case "Configuration":
			return "Un problème est survenu lors de la lecture de la configuration du site. Veuillez vérifier les journaux d'événements pour plus d'informations.";

		case "AccessDenied":
			return "Vous n'avez pas les autorisations nécessaires pour vous authentifier sur ce site.";

		case "Verification":
			return "Votre jeton de vérification est invalide ou a expiré. Veuillez vous reconnecter.";

		default:
			return undefined;
	}
}