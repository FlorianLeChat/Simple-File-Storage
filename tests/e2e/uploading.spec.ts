import { join } from "path";
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
} );

test( "Téléversement d'un fichier valide", async ( { page } ) =>
{
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
} );

test( "Téléversement d'un fichier public par défaut", async ( { page } ) =>
{
	await page.goto( "/settings/storage" );
	await page.getByLabel( "Enable automatic publication of uploaded files to the server" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await page.goto( "/dashboard" );
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/cat.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
	await expect( page.getByText( "public" ) ).toHaveCount( 1 );
} );

test( "Téléversement d'un fichier vide", async ( { page } ) =>
{
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/empty.txt" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = error]" ) ).toHaveCount( 1 );
} );

test( "Téléversement d'un fichier compressé", async ( { page } ) =>
{
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/seagull.png" ) );
	await page.getByText( "Click here to display advanced settings." ).click();
	await page.getByLabel( "Enable image compression" ).click();
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByLabel( "Close toast" ).click();

	await expect( page.getByRole( "cell", { name: "433.35 KB" } ) ).toHaveCount( 1 );
} );

test( "Téléversement d'un fichier chiffré", async ( { page } ) =>
{
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/fox.jpg" ) );
	await page.getByText( "Click here to display advanced settings." ).click();
	await page.getByLabel( "Enable enhanced encryption" ).click();
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
	await expect( page.getByRole( "button", { name: "Copy to Clipboard" } ) ).toHaveCount( 1 );
} );