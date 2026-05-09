import { join } from "path";
import { faker } from "@faker-js/faker";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

test.beforeEach( async ( { page } ) =>
{
	execSync( "node scripts/create-fake-accounts.js" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );

	await page.goto( "/settings/user" );
} );

test( "Mise à jour des informations du compte utilisateur", async ( { page } ) =>
{
	await page.getByPlaceholder( "Firstname Lastname" ).fill( faker.person.fullName() );
	await page.getByPlaceholder( "name@domain.com" ).fill( "test10@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4017" );
	await page.getByLabel( "Preferred Language" ).click();
	await page.getByLabel( "French" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Connexion" } ).click();
	await page.getByPlaceholder( "prenom.nom@mon-domaine.fr" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MonMotDePasse123!" ).fill( "Florian4016" );
	await page.getByText( "Se connecter par mot de passe" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = error]" ) ).toHaveCount( 1 );

	await page.getByPlaceholder( "prenom.nom@mon-domaine.fr" ).fill( "test10@gmail.com" );
	await page.getByPlaceholder( "@MonMotDePasse123!" ).fill( "Florian4017" );
	await page.getByText( "Se connecter par mot de passe" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
} );

test( "Mise à jour des paramètres d'apparence du site", async ( { page } ) =>
{
	await page.goto( "/settings/layout" );
	await page.getByLabel( "Font" ).click();
	await page.getByLabel( "Roboto" ).click();
	await page.getByRole( "button", { name: "Red" } ).click();
	await page.locator( "label" ).filter( { hasText: "Dark" } ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
	await expect( page.locator( "html" ) ).toHaveClass( /roboto red dark/ );
} );

test( "Création d'un nouveau signalement de bogue", async ( { page } ) =>
{
	await page.goto( "/settings/issue" );
	await page.getByLabel( "Severity" ).click();
	await page.getByLabel( "Critical" ).click();
	await page.getByRole( "button", { name: "Send" } ).click();

	await expect( page.getByText( "Invalid length: Expected >=10 but received 0" ) ).toHaveCount( 1 );
	await expect( page.getByText( "Invalid length: Expected >=50 but received 0" ) ).toHaveCount( 1 );

	await page.getByPlaceholder( "There is a problem with..." ).fill( faker.word.words( 5 ) );
	await page.getByPlaceholder( "Please include all relevant information in your report." ).fill( faker.word.words( 10 ) );
	await page.getByRole( "button", { name: "Send" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
} );

test( "Suppression RGPD des fichiers utilisateur", async ( { page } ) =>
{
	await page.goto( "/dashboard" );
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 1 );

	await page.goto( "/settings/privacy" );
	await page
		.getByLabel(
			"I want to delete my files as well as all associated data permanently without the possibility of recovery via technical support."
		)
		.click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.goto( "/dashboard" );

	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 0 );
} );

test( "Suppression RGPD du compte utilisateur", async ( { page } ) =>
{
	await page.goto( "/settings/privacy" );
	await page
		.getByLabel(
			"I want to delete my user account as well as all associated data permanently without the possibility of recovery via technical support."
		)
		.click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = error]" ) ).toHaveCount( 1 );
} );