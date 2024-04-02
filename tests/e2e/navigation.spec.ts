import { test, expect } from "@playwright/test";

//
// Accès à la page d'accueil avant chaque test.
//
test.beforeEach( async ( { page } ) =>
{
	// Accès à la page d'accueil.
	await page.goto( "/" );

	// Attente de la fin du chargement de la page.
	await page.locator( ".loading" ).waitFor( { state: "hidden" } );
} );

//
// Vérification de l'accessibilité du site et des contenus associés.
//
test( "Vérification de certains contenus", async ( { page } ) =>
{
	// Vérification du titre de la page.
	await expect( page ).toHaveTitle( "Home – Simple File Storage" );
} );