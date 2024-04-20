import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Authentification et accès au tableau de bord avant chaque test.
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
} );

//
// Téléversement d'un premier fichier valide.
//
test( "Téléversement d'un fichier valide", async ( { page } ) =>
{
	// Ouverture de la fenêtre de dialogue pour ajouter un fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();

	// Ajout d'une image quelconque.
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/raccoon.jpg" ) );

	// Clic sur le bouton de téléversement.
	await page.getByRole( "button", { name: "Upload" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );

//
// Téléversement d'un deuxième fichier valide et public.
//
test( "Téléversement d'un fichier public par défaut", async ( { page } ) =>
{
	// Accès aux paramètres utilisateur concernant le stockage.
	await page.goto( "/settings/storage" );

	// Activation de la publication automatique des fichiers téléversés.
	await page
		.getByLabel(
			"Enable automatic publication of uploaded files to the server"
		)
		.click();
	await page.getByRole( "button", { name: "Update" } ).click();

	// Retour à la page du tableau de bord et ouverture de la fenêtre de dialogue
	//  pour ajouter un fichier.
	await page.goto( "/dashboard" );
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();

	// Ajout d'une image quelconque.
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/cat.jpg" ) );

	// Clic sur le bouton de téléversement.
	await page.getByRole( "button", { name: "Upload" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Vérification de la visibilité du fichier téléversé.
	await expect( page.getByText( "public" ) ).toHaveCount( 1 );
} );

//
// Téléversement d'un troisième fichier vide (sans contenu).
//
test( "Téléversement d'un fichier vide", async ( { page } ) =>
{
	// Téléversement d'un fichier vide.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/empty.txt" ) );
	await page.getByRole( "button", { name: "Upload" } ).click();

	// Attente de la réponse du serveur et de la notification d'erreur.
	//  Note : la réponse sera négative car le fichier est vide.
	await expect(
		page.locator( "[data-sonner-toast][data-type = error]" )
	).toHaveCount( 1 );
} );

//
// Téléversement d'un quatrième fichier avec compression côte serveur.
//
test( "Téléversement d'un fichier compressé", async ( { page } ) =>
{
	// Téléversement d'un fichier quelconque.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/seagull.png" ) );

	// Affichage des paramètres de téléversement avancés.
	await page.getByText( "Click here to display advanced settings." ).click();

	// Activation de la compression des images et téléversement du fichier.
	await page.getByLabel( "Enable image compression" ).click();
	await page.getByRole( "button", { name: "Upload" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Fermeture de la boite de dialogue et vérification de la taille du fichier.
	//  Note : la taille du fichier original est de 433 KB.
	await page.getByLabel( "Close toast" ).click();
	await expect( page.getByRole( "cell", { name: "124.4 KB" } ) ).toHaveCount( 1 );
} );

//
// Téléversement d'un cinquième fichier avec chiffrement côte client.
//
test( "Téléversement d'un fichier chiffré", async ( { page } ) =>
{
	// Téléversement d'un fichier quelconque et ouverture des paramètres avancés.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/fox.jpg" ) );
	await page.getByText( "Click here to display advanced settings." ).click();

	// Activation du chiffrement des fichiers dans le navigateur avant
	//  un quelconque téléversement au serveur.
	await page.getByLabel( "Enable enhanced encryption" ).click();
	await page.getByRole( "button", { name: "Upload" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Attente de l'ouverture d'une boite de dialogue contenant une clé
	//  de déchiffrement pour le fichier téléversé.
	await expect(
		page.getByRole( "button", { name: "Copy to Clipboard" } )
	).toHaveCount( 1 );
} );