import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Vérification du contrôle des notifications pour les utilisateurs.
//
test( "Vérification du contrôle des notifications", async ( { page } ) =>
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

	// Première mise à jour des informations du compte utilisateur.
	//  Note : une notification est envoyée pour indiquer que le mot de passe a été modifié.
	await page.goto( "/settings/user" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4017" );
	await page.getByRole( "button", { name: "Update" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Mise à jour des préférences de notification.
	await page.goto( "/settings/notifications" );
	await page.getByRole( "switch" ).last().click();
	await page.getByRole( "button", { name: "Update" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Réception des notifications et marquage de toutes comme lues.
	await page.reload();
	await page.locator( ".lucide-bell-ring" ).click();
	await expect( page.getByText( "Password Change" ) ).toHaveCount( 1 );
	await page.getByRole( "button", { name: "Mark All as Read" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Deuxième mise à jour des informations du compte utilisateur.
	//  Note : la notification ne doit pas être envoyée cette fois-ci.
	await page.goto( "/settings/user" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4018" );
	await page.getByRole( "button", { name: "Update" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Attente de la réception des notifications et vérification des notifications.
	await page.reload();
	await page.locator( ".lucide-bell-ring" ).click();
	await expect( page.getByText( "Password Change" ) ).toHaveCount( 0 );
} );