import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

//
// Accès à la page d'authentification avant chaque test.
//
test.beforeEach( async ( { page } ) =>
{
	// Accès à la page d'authentification.
	await page.goto( "/authentication" );

	// Attente de la fin du chargement de la page.
	await page.locator( ".loading" ).waitFor( { state: "hidden" } );
} );

//
// Création d'un nouveau compte utilisateur.
//
test( "Création d'un compte utilisateur inédit", async ( { page } ) =>
{
	// Clic sur l'onglet « Inscription ».
	await page.getByRole( "tab", { name: "Register" } ).click();

	// Remplissage du champ de saisie de l'adresse éléctronique.
	await page.getByPlaceholder( "name@domain.com" ).fill( faker.internet.email() );

	// Clic sur le bouton de création de compte.
	await page.getByText( "Register by email" ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car le serveur de messagerie
	//   ne sera pas configuré dans l'environnement de test.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );
} );

//
// Création d'un compte utilisateur déjà existant.
//
test( "Création d'un compte utilisateur déjà existant", async ( { page } ) =>
{
	// Clic sur l'onglet « Inscription ».
	await page.getByRole( "tab", { name: "Register" } ).click();

	// Remplissage du champ de saisie de l'adresse éléctronique.
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );

	// Clic sur le bouton de création de compte.
	await page.getByText( "Register by email" ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car l'adresse éléctronique
	//   est déjà utilisée par un autre compte utilisateur.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );
} );

//
// Connexion échouée à un compte utilisateur.
//
test( "Connexion échouée à un compte utilisateur", async ( { page } ) =>
{
	// Clic sur l'onglet « Connexion ».
	await page.getByRole( "tab", { name: "Login" } ).click();

	// Remplissage des champs de saisie de l'adresse éléctronique et du mot de passe.
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "WrongPassword!" );

	// Clic sur le bouton de connexion.
	await page.getByText( "Log in by password" ).click();

	// Attente de la réponse du serveur sous forme de notification.
	//  Note : la réponse sera négative car le mot de passe est incorrect.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );
} );

//
// Connexion réussie à un compte utilisateur.
//
test( "Connexion réussie à un compte utilisateur", async ( { page } ) =>
{
	// Clic sur l'onglet « Connexion ».
	await page.getByRole( "tab", { name: "Login" } ).click();

	// Remplissage des champs de saisie de l'adresse éléctronique et du mot de passe.
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );

	// Clic sur le bouton de connexion.
	await page.getByText( "Log in by password" ).click();

	// Attente de la redirection vers la page du tableau de bord.
	await expect( page ).toHaveURL( "/dashboard" );
} );

//
// Déconnexion d'un compte utilisateur connecté.
//
test( "Déconnexion d'un compte utilisateur", async ( { page } ) =>
{
	// Clic sur l'onglet « Connexion ».
	await page.getByRole( "tab", { name: "Login" } ).click();

	// Remplissage des champs de saisie de l'adresse éléctronique et du mot de passe.
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );

	// Clic sur le bouton de connexion.
	await page.getByText( "Log in by password" ).click();

	// Attente de la redirection vers la page du tableau de bord.
	await expect( page ).toHaveURL( "/dashboard" );

	// Clic sur le bouton d'ouverture du menu utilisateur.
	await page.locator( "header aside button:last-of-type" ).click();

	// Clic sur le bouton de déconnexion.
	await page.getByText( "Logout" ).click();

	// Attente de la redirection vers la page d'accueil.
	await expect( page ).toHaveURL( "/" );
} );