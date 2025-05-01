import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Vérification du contrôle des notifications pour les utilisateurs.
//
test( "Vérification du contrôle des notifications", async ( { page } ) =>
{
	// Déclaration du test comme étant lent/instable.
	test.slow();

	// Réinitialisation des comptes utilisateurs factices.
	execSync( "node scripts/create-fake-accounts.js" );

	// Authentification et accès au tableau de bord.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Téléversement de deux fichiers quelconques.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.locator( "input[type = file]" )
		.setInputFiles( [
			join( __dirname, "static/cat.jpg" ),
			join( __dirname, "static/duck.jpg" )
		] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Ajout d'un utilisateur en partage en écriture sur le
	//  premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test2@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Ajout d'un utilisateur en partage en écriture sur le
	//  deuxième fichier téléversé.
	await page.getByRole( "button", { name: "Open action menu" } ).last().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test2@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test2@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Réception des notifications et marquage de toutes comme lues.
	await page.locator( ".lucide-bell-ring" ).click();
	await expect( page.getByText( "Folder Sharing" ) ).toHaveCount( 2 );
	await page.getByRole( "button", { name: "Mark All as Read" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Suppression du partage en écriture du premier fichier partagé.
	await page.goto( "/dashboard" );
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Réception des notifications et vérification de la notification
	//  de suppression du partage.
	await expect( page ).toHaveURL( "/dashboard" );
	await page.locator( ".lucide-bell-ring" ).click();
	await expect( page.getByText( "Deletion of a Shared File" ) ).toHaveCount( 1 );
	await page.getByRole( "button", { name: "Mark All as Read" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Mise à jour des préférences de notification (désactivation totale).
	await page.goto( "/settings/notifications" );
	await page.getByRole( "switch" ).last().click();
	await page.getByRole( "button", { name: "Update" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Suppression du partage en écriture du deuxième fichier partagé.
	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Attente de la réception des notifications et vérification des notifications.
	await page.locator( ".lucide-bell-ring" ).click();
	await expect( page.getByText( "Deletion of a Shared File" ) ).toHaveCount( 0 );
} );