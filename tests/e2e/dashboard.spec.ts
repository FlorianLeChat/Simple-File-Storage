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

	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.locator( "input[type = file]" )
		.setInputFiles( [
			join( __dirname, "static/raccoon.jpg" ),
			join( __dirname, "static/duck.jpg" ),
			join( __dirname, "static/seagull.png" )
		] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
} );

test( "Publication d'un fichier téléversé", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "public" ) ).toHaveCount( 1 );
	await expect( page.getByText( "private" ) ).toHaveCount( 2 );
} );

test( "Privatisation d'un fichier téléversé", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Make Private" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "private" ) ).toHaveCount( 3 );
} );

test( "Renommage d'un fichier téléversé", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "duck" ).fill( "dock" );
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "dock" ) ).toHaveCount( 1 );
} );

test( "Accès vers un fichier téléversé", async ( { page } ) =>
{
	// https://github.com/microsoft/playwright/issues/15860
	test.skip();

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Copy access link" } ).click();
	await page.getByRole( "menuitem", { name: "Access file" } ).click();
} );

test( "Vérification de l'extension dans le lien d'accès", async ( { page } ) =>
{
	// https://github.com/microsoft/playwright/issues/15860
	test.skip();

	await page.goto( "/settings/storage" );
	await page.getByLabel( "File Extension Display" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Copy access link" } ).click();
	await page.getByRole( "menuitem", { name: "Access file" } ).click();
} );

test( "Suppression d'un fichier téléversé", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "private" ) ).toHaveCount( 2 );
} );

test( "Publication de tous les fichiers sélectionnés", async ( { page } ) =>
{
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "public" ) ).toHaveCount( 3 );
} );

test( "Privatisation de tous les fichiers sélectionnés", async ( { page } ) =>
{
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Make Private" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "private" ) ).toHaveCount( 3 );
} );

test( "Renommage de tous les fichiers sélectionnés", async ( { page } ) =>
{
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "duck" ).fill( "dock" );
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "dock" ) ).toHaveCount( 3 );
} );

test( "Suppression de tous les fichiers sélectionnés", async ( { page } ) =>
{
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByText( "public" ) ).toHaveCount( 0 );
	await expect( page.getByText( "private" ) ).toHaveCount( 0 );
} );