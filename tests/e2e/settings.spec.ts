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

	// Téléversement d'un nouvel avatar.
	await page
		.getByLabel( "Avatar" )
		.setInputFiles( join( __dirname, "static/avatar.jpg" ) );
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
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car les champs requis ne sont pas remplis.
	await expect(
		page.getByText( "The provided value is too small." )
	).toHaveCount( 2 );

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
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur sous forme de notification.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );