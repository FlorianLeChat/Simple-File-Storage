import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

test( "Vérification du contrôle des notifications", async ( { page } ) =>
{
	test.slow();

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
		.setInputFiles( [ join( __dirname, "static/cat.jpg" ), join( __dirname, "static/duck.jpg" ) ] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test2@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 2 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.getByRole( "button", { name: "Open action menu" } ).last().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test2@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 2 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test2@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );

	await page.locator( ".lucide-bell-ring" ).click();

	await expect( page.getByText( "Folder Sharing" ) ).toHaveCount( 2 );

	await page.getByRole( "button", { name: "Mark All as Read" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page ).toHaveURL( "/dashboard" );

	await page.locator( ".lucide-bell-ring" ).click();

	await expect( page.getByText( "Deletion of a Shared File" ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Mark All as Read" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.goto( "/settings/notifications" );
	await page.getByRole( "switch" ).last().click();
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.goto( "/dashboard" );
	await page.getByRole( "button", { name: "Open action menu" } ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByRole( "button", { name: "Permanently Delete" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( ".lucide-bell-ring" ).click();

	await expect( page.getByText( "Deletion of a Shared File" ) ).toHaveCount( 0 );
} );