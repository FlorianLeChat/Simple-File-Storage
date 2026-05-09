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
			join( __dirname, "static/cat.jpg" ),
			join( __dirname, "static/duck.jpg" ),
			join( __dirname, "static/fox.jpg" ),
			join( __dirname, "static/raccoon.jpg" ),
			join( __dirname, "static/seagull.png" )
		] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );
} );

test( "Partage d'un fichier en lecture pour visionnage", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test2@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

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
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).toBeDisabled();
} );

test( "Partage d'un fichier en lecture pour révocation", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test2@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

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
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).toBeDisabled();

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "Remove All Shares" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

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
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 0 );
} );

test( "Partage d'un fichier en écriture pour partage", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 1 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test3@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test3@gmail.com" } ).getByRole( "button" ).click();

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
	await page.getByPlaceholder( "name@domain.com" ).fill( "test3@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).not.toBeDisabled();

	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test4@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test4@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByPlaceholder( "Search..." ).fill( "test5@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test5@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test4@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).toBeDisabled();
} );

test( "Partage d'un fichier en écriture pour renommage", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 2 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test3@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test3@gmail.com" } ).getByRole( "button" ).click();

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
	await page.getByPlaceholder( "name@domain.com" ).fill( "test3@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "fox" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).not.toBeDisabled();

	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "fox" ).fill( "fux" );
	await page.getByRole( "button", { name: "Update" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByRole( "cell", { name: "fux" } ) ).toHaveCount( 1 );

	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "fux" } ) ).toHaveCount( 1 );
} );

test( "Partage d'un fichier en écriture pour suppression", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 4 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test4@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test4@gmail.com" } ).getByRole( "button" ).click();

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
	await page.getByPlaceholder( "name@domain.com" ).fill( "test4@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).not.toBeDisabled();

	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 0 );

	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 0 );
} );

test( "Partage d'un fichier en écriture pour versionnage", async ( { page } ) =>
{
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 3 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test5@gmail.com" );
	await page.locator( "li" ).filter( { hasText: "test5@gmail.com" } ).getByRole( "button" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 2 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( [ join( __dirname, "static/duplication/raccoon.jpg" ) ] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 3 ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();

	await expect( page ).toHaveURL( "/" );

	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test5@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();

	await expect( page ).toHaveURL( "/dashboard" );
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 1 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();

	await expect( page.getByRole( "menuitem", { name: "Make Public" } ) ).not.toBeDisabled();

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page.locator( "input[type = file]" ).setInputFiles( [ join( __dirname, "static/duplication/raccoon.jpg" ) ] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();

	await expect( page.locator( "[data-sonner-toast][data-type = success]" ) ).toHaveCount( 1 );

	await page.reload(); // https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372

	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 2 );

	await page.getByRole( "button", { name: "Open action menu" } ).first().click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );
} );