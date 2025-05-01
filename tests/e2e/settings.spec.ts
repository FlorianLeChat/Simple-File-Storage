import { join } from "path";
import { faker } from "@faker-js/faker";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Authentification et accès à la page des paramètres utilisateur avant chaque test.
//
test.beforeEach( async ( { page } ) =>
{
	// Réinitialisation des comptes utilisateurs factices.
	execSync( "node scripts/create-fake-accounts.js" );

	// Accès à la page d'authentification.
	await page.goto( "/authentication" );

	// Clic sur l'onglet « Connexion ».
	await page.getByRole( "tab", { name: "Login" } ).click();

	// Remplissage des champs de saisie de l'adresse électronique et du mot de passe.
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );

	// Clic sur le bouton de connexion.
	await page.getByText( "Log in by password" ).click();

	// Attente de la redirection vers la page du tableau de bord.
	await expect( page ).toHaveURL( "/dashboard" );

	// Redirection vers la page des paramètres utilisateur.
	await page.goto( "/settings/user" );
} );

//
// Mise à jour des informations du compte utilisateur.
//
test( "Mise à jour des informations du compte utilisateur", async ( { page } ) =>
{
	// Remplissage des champs de saisie du prénom, du nom, de l'adresse électronique.
	//  et du mot de passe.
	await page
		.getByPlaceholder( "Firstname Lastname" )
		.fill( faker.person.fullName() );
	await page.getByPlaceholder( "name@domain.com" ).fill( "test10@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4017" );

	// Sélection de la langue préférée.
	await page.getByLabel( "Preferred Language" ).click();
	await page.getByLabel( "French" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur sous forme de notification.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Procédure de déconnexion et de reconnexion au compte utilisateur.
	//  Note : la procédure utilisera les anciennes informations de connexion.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Connexion" } ).click();
	await page
		.getByPlaceholder( "prenom.nom@mon-domaine.fr" )
		.fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MonMotDePasse123!" ).fill( "Florian4016" );
	await page.getByText( "Se connecter par mot de passe" ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car le mot de passe est désormais incorrect.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );

	// Procédure de connexion avec les nouvelles informations de connexion.
	await page
		.getByPlaceholder( "prenom.nom@mon-domaine.fr" )
		.fill( "test10@gmail.com" );
	await page.getByPlaceholder( "@MonMotDePasse123!" ).fill( "Florian4017" );
	await page.getByText( "Se connecter par mot de passe" ).click();

	// Attente de la redirection vers la page du tableau de bord.
	await expect( page ).toHaveURL( "/dashboard" );
} );

//
// Mise à jour des paramètres de sécurité du compte utilisateur.
//
test( "Mise à jour des paramètres d'apparence du site", async ( { page } ) =>
{
	// Redirection vers la page des paramètres d'apparence.
	await page.goto( "/settings/layout" );

	// Sélection de la police de caractères.
	await page.getByLabel( "Font" ).click();
	await page.getByLabel( "Roboto" ).click();

	// Sélection de la couleur principale.
	await page.getByRole( "button", { name: "Red" } ).click();

	// Sélection du thème sombre.
	await page.locator( "label" ).filter( { hasText: "Dark" } ).click();

	// Clic sur le bouton de mise à jour.
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur sous forme de notification.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Vérification de l'application des paramètres d'apparence.
	await expect( page.locator( "html" ) ).toHaveClass( /roboto red dark/ );
} );

//
// Création d'un nouveau signalement de bogue.
//
test( "Création d'un nouveau signalement de bogue", async ( { page } ) =>
{
	// Redirection vers la page des signalements de bogue.
	await page.goto( "/settings/issue" );

	// Sélection de la sévérité du bogue.
	await page.getByLabel( "Severity" ).click();
	await page.getByLabel( "Critical" ).click();

	// Clic sur le bouton de création du signalement.
	await page.getByRole( "button", { name: "Send" } ).click();

	// Attente de la réponse du serveur sous forme d'un message d'erreur.
	//  Note : la réponse sera négative car les champs requis ne sont pas remplis.
	await expect(
		page.getByText( "Invalid length: Expected >=10 but received 0" )
	).toHaveCount( 1 );

	await expect(
		page.getByText( "Invalid length: Expected >=50 but received 0" )
	).toHaveCount( 1 );

	// Remplissage des champs de saisie du titre et de la description du bogue.
	await page
		.getByPlaceholder( "There is a problem with..." )
		.fill( faker.word.words( 5 ) );

	await page
		.getByPlaceholder(
			"Please include all relevant information in your report."
		)
		.fill( faker.word.words( 10 ) );

	// Clic sur le bouton de création du signalement.
	await page.getByRole( "button", { name: "Send" } ).click();

	// Attente de la réponse du serveur sous forme de notification.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );

//
// Suppression des fichiers utilisateur depuis les paramètres de confidentialité.
//
test( "Suppression RGPD des fichiers utilisateur", async ( { page } ) =>
{
	// Accès la page du tableau de bord et téléversement d'un fichier.
	await page.goto( "/dashboard" );
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.locator( "input[type = file]" )
		.setInputFiles( join( __dirname, "static/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	// Attente de la réponse du serveur sous forme de notification de succès
	//  et vérification de la présence du fichier téléversé.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 1 );

	// Accès à la page des paramètres de confidentialité et suppression du fichier.
	await page.goto( "/settings/privacy" );
	await page
		.getByLabel(
			"I want to delete my files as well as all associated data permanently without the possibility of recovery via technical support."
		)
		.click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	// Attente de la réponse du serveur sous forme de notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Retour sur la page du tableau de bord et vérification de la suppression du fichier.
	await page.goto( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 0 );
} );

//
// Suppression du compte et fichiers utilisateurs depuis les paramètres de confidentialité.
//
test( "Suppression RGPD du compte utilisateur", async ( { page } ) =>
{
	// Accès à la page des paramètres de confidentialité et suppression du compte utilisateur.
	await page.goto( "/settings/privacy" );
	await page
		.getByLabel(
			"I want to delete my user account as well as all associated data permanently without the possibility of recovery via technical support."
		)
		.click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	// Vérification de la redirection vers la page d'accueil.
	await expect( page ).toHaveURL( "/" );

	// Accès à la page d'authentification et tentative de connexion.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car le compte a été supprimé.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );
} );