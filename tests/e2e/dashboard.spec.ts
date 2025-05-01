import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Authentification, accès au tableau de bord et téléversement
//  de plusieurs fichiers avant chaque test.
//
test.beforeEach( async ( { page } ) =>
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

	// Ouverture de la fenêtre de dialogue pour ajouter un fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();

	// Téléversement d'un fichier quelconque.
	await page
		.locator( "input[type = file]" )
		.setInputFiles( [
			join( __dirname, "static/raccoon.jpg" ),
			join( __dirname, "static/duck.jpg" ),
			join( __dirname, "static/seagull.png" )
		] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );

//
// Publication du premier fichier téléversé.
//
test( "Publication d'un fichier téléversé", async ( { page } ) =>
{
	// Ouverture du menu des actions pour rendre public le premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la publication du fichier.
	await expect( page.getByText( "public" ) ).toHaveCount( 1 );
	await expect( page.getByText( "private" ) ).toHaveCount( 2 );
} );

//
// Privatisation du premier fichier téléversé.
//
test( "Privatisation d'un fichier téléversé", async ( { page } ) =>
{
	// Ouverture du menu des actions pour rendre privé le premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Make Private" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la privatisation du fichier.
	await expect( page.getByText( "private" ) ).toHaveCount( 3 );
} );

//
// Renommage du premier fichier téléversé.
//
test( "Renommage d'un fichier téléversé", async ( { page } ) =>
{
	// Ouverture du menu des actions pour renommer le premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "duck" ).fill( "dock" );
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification du renommage du fichier.
	await expect( page.getByText( "dock" ) ).toHaveCount( 1 );
} );

//
// Accès à un fichier téléversé.
//
test( "Accès vers un fichier téléversé", async ( { page } ) =>
{
	// Ce test n'est pas possible pour le moment car Playwright ne supporte pas
	//  l'écriture/lecture du presse-papiers dans les tests automatisés.
	// https://github.com/microsoft/playwright/issues/15860
	test.skip();

	// Ouverture du menu des actions pour accéder au premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Copy access link" } ).click();
	await page.getByRole( "menuitem", { name: "Access file" } ).click();
} );

//
// Vérification de la présence d'une extension dans le lien d'accès.
//
test( "Vérification de l'extension dans le lien d'accès", async ( { page } ) =>
{
	// Ce test n'est pas possible pour le moment car Playwright ne supporte pas
	//  l'écriture/lecture du presse-papiers dans les tests automatisés.
	// https://github.com/microsoft/playwright/issues/15860
	test.skip();

	// Accès aux paramètres utilisateur concernant le stockage.
	await page.goto( "/settings/storage" );

	// Activation de l'affichage de l'extension dans le lien d'accès.
	await page.getByLabel( "File Extension Display" ).click();
	await page.getByRole( "button", { name: "Update" } ).click();

	// Retour à la page du tableau de bord et accès au premier fichier téléversé.
	await page.goto( "/dashboard" );
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Copy access link" } ).click();
	await page.getByRole( "menuitem", { name: "Access file" } ).click();
} );

//
// Suppression d'un fichier téléversé.
//
test( "Suppression d'un fichier téléversé", async ( { page } ) =>
{
	// Ouverture du menu des actions pour supprimer le premier fichier téléversé.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la suppression du fichier.
	await expect( page.getByText( "private" ) ).toHaveCount( 2 );
} );

//
// Publication de tous les fichiers sélectionnés.
//
test( "Publication de tous les fichiers sélectionnés", async ( { page } ) =>
{
	// Sélection de tous les fichiers téléversés.
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	// Ouverture du menu des actions pour rendre public l'ensemble
	//  des fichiers sélectionnés.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la publication des fichiers.
	await expect( page.getByText( "public" ) ).toHaveCount( 3 );
} );

//
// Privatisation de tous les fichiers sélectionnés.
//
test( "Privatisation de tous les fichiers sélectionnés", async ( { page } ) =>
{
	// Sélection de tous les fichiers téléversés.
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	// Ouverture du menu des actions pour rendre public l'ensemble
	//  des fichiers sélectionnés.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Make Public" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Sélection de tous les fichiers téléversés et privatisation.
	//  Note : on doit d'abord rendre les fichiers publics pour les privatiser
	//   après afin que le serveur refuse de privatiser un fichier déjà privé.
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Make Private" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la privatisation des fichiers.
	await expect( page.getByText( "private" ) ).toHaveCount( 3 );
} );

//
// Renommage de tous les fichiers sélectionnés.
//
test( "Renommage de tous les fichiers sélectionnés", async ( { page } ) =>
{
	// Sélection de tous les fichiers téléversés.
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	// Ouverture du menu des actions pour renommer l'ensemble des
	//  fichiers sélectionnés.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "duck" ).fill( "dock" );
	await page.getByRole( "button", { name: "Update" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification du renommage des fichiers.
	await expect( page.getByText( "dock" ) ).toHaveCount( 3 );
} );

//
// Suppression de tous les fichiers sélectionnés.
//
test( "Suppression de tous les fichiers sélectionnés", async ( { page } ) =>
{
	// Sélection de tous les fichiers téléversés.
	await page.getByLabel( "Select line" ).first().click();
	await page.getByLabel( "Select line" ).nth( 1 ).click();
	await page.getByLabel( "Select line" ).last().click();

	// Ouverture du menu des actions pour supprimer l'ensemble des
	//  fichiers sélectionnés.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();

	// Attente de la réponse du serveur et de la notification de succès.
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification du renommage des fichiers.
	await expect( page.getByText( "public" ) ).toHaveCount( 0 );
	await expect( page.getByText( "private" ) ).toHaveCount( 0 );
} );