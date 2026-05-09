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
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
} );

test( "Vérification de la création d'une nouvelle version", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "153.56 KB", { exact: true } ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/duplication/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );
} );

test( "Restauration d'une ancienne version", async ( { page } ) =>
{
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( join( __dirname, "static/duplication/raccoon.jpg" ) );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Restore" } ).last().click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.getByText( "153.56 KB", { exact: true } ) ).toHaveCount( 2 );
	await expect( page.getByText( "+97.77 KB" ) ).toHaveCount( 1 );
} );

test( "Suppression du versionnage des fichiers téléversés", async ( { page } ) =>
{
	await page.goto( "/settings/storage" );
	await page.getByLabel( "Automatically save old versions of files" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).click();

	await expect( page.getByRole( "menuitem", { name: "View Revisions" } ) ).toBeDisabled();
} );