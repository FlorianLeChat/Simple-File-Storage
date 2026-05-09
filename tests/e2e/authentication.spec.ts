import { faker } from "@faker-js/faker";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

test.beforeEach( async ( { page } ) =>
{
	execSync( "node scripts/create-fake-accounts.js" );

	await page.goto( "/authentication" );
} );

test( "Création d'un compte utilisateur inédit", async ( { page } ) =>
{
	await page.getByRole( "tab", { name: "Register" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( faker.internet.email() );
	await page.getByText( "Register by email" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = info]" ) ).toHaveCount( 1 );
} );

test( "Création d'un compte utilisateur déjà existant", async ( { page } ) =>
{
	await page.getByRole( "tab", { name: "Register" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByText( "Register by email" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = error]" ) ).toHaveCount( 1 );
} );

test( "Connexion échouée à un compte utilisateur", async ( { page } ) =>
{
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "WrongPassword!" );
	await page.getByText( "Log in by password" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = error]" ) ).toHaveCount( 1 );
} );

test( "Connexion réussie à un compte utilisateur", async ( { page } ) =>
{
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
} );

test( "Déconnexion d'un compte utilisateur", async ( { page } ) =>
{
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );

	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );
} );