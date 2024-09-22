import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Authentification, accès au tableau de bord et téléversement
//  d'un fichier quelconque avant chaque test.
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

	// Ouverture de la fenêtre de dialogue pour ajouter un fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();

	// Téléversement d'un fichier quelconque.
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/raccoon.jpg" ) );
	await page.getByRole( "button", { name: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );

//
// Création d'une nouvelle version d'un fichier portant le même nom.
//
test( "Vérification de la création d'une nouvelle version", async ( { page } ) =>
{
	// Accès aux révisions du fichier par défaut.
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	// Vérification de l'existence de la première version.
	await expect( page.getByText( "153.56 KB", { exact: true } ) ).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Ajout d'une nouvelle version du fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/duplication/raccoon.jpg" ) );
	await page.getByRole( "button", { name: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Ouverture de nouveau du menu des actions et vérification de
	//  la différence de taille entre les deux versions.
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );
} );

//
// Restauration d'une ancienne version d'un fichier.
//
test( "Restauration d'une ancienne version", async ( { page } ) =>
{
	// Ajout d'une nouvelle version du fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.getByRole( "textbox", { name: "File Upload" } )
		.setInputFiles( join( __dirname, "static/duplication/raccoon.jpg" ) );
	await page.getByRole( "button", { name: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Vérification de la présence de deux versions du fichier.
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );

	// Restauration de la première version du fichier.
	await page.getByRole( "button", { name: "Restore" } ).last().click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Vérification de la restauration de la première version.
	await expect( page.getByText( "153.56 KB", { exact: true } ) ).toHaveCount( 2 );
	await expect( page.getByText( "+97.77 KB" ) ).toHaveCount( 1 );
} );

//
// Suppression du versionnage des fichiers.
//
test( "Suppression du versionnage des fichiers téléversés", async ( { page } ) =>
{
	// Accès aux paramètres utilisateur concernant le stockage.
	await page.goto( "/settings/storage" );

	// Désactivation du versionnage des fichiers.
	await page.getByLabel( "Automatically save old versions of files" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	// Retour à la page du tableau de bord et ouverture de la fenêtre de dialogue
	//  pour ajouter un fichier.
	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await expect(
		page.getByRole( "menuitem", { name: "View Revisions" } )
	).toBeDisabled();
} );