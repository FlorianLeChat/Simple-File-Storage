import { join } from "path";
import { execSync } from "child_process";
import { test, expect } from "@playwright/test";

//
// Authentification, accès au tableau de bord et téléversement
//  de 5 fichiers avant chaque test.
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
			join( __dirname, "static/cat.jpg" ),
			join( __dirname, "static/duck.jpg" ),
			join( __dirname, "static/fox.jpg" ),
			join( __dirname, "static/raccoon.jpg" ),
			join( __dirname, "static/seagull.png" )
		] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );
} );

//
// Partage d'un fichier en lecture et vérification de l'accès.
//
test( "Partage d'un fichier en lecture pour visionnage", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();

	// Recherche et ajout d'un utilisateur pour le partage en lecture.
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test2@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en lecture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test2@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en lecture.
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 1 );

	// Vérification de l'absence du bouton de partage du fichier partagé en lecture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).toBeDisabled();
} );

//
// Partage d'un fichier en lecture et révocation de l'accès.
//
test( "Partage d'un fichier en lecture pour révocation", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();

	// Recherche et ajout d'un utilisateur pour le partage en lecture.
	await page.getByPlaceholder( "Search..." ).fill( "test2@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test2@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en lecture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test2@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en lecture.
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 1 );

	// Vérification de l'absence du bouton de partage du fichier partagé en lecture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).toBeDisabled();

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partageant le fichier.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Ouverture du menu des actions et révocation de tous les partages.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "Remove All Shares" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en lecture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test2@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de l'absence du fichier partagé en lecture.
	await expect( page.getByRole( "cell", { name: "cat" } ) ).toHaveCount( 0 );
} );

//
// Partage d'un fichier en écriture et partage en lecture par l'utilisateur partagé.
//
test( "Partage d'un fichier en écriture pour partage", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 1 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test3@gmail.com" );

	// Recherche et ajout d'un utilisateur pour le partage en écriture.
	await page
		.locator( "li" )
		.filter( { hasText: "test3@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Modification des permissions de partage pour l'utilisateur en écriture.
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test3@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en écriture.
	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	// Vérification de la présence du bouton de partage du fichier partagé en écriture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).not.toBeDisabled();

	// Partage du fichier partagé en écriture en lecture à deux autres utilisateurs.
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();

	await page.getByPlaceholder( "Search..." ).fill( "test4@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test4@gmail.com" } ) // Premier utilisateur.
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	await page.getByPlaceholder( "Search..." ).fill( "test5@gmail.com" );
	await page
		.locator( "li" )
		.filter( { hasText: "test5@gmail.com" } ) // Deuxième utilisateur.
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la présence du fichier renommé partagé en écriture.
	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	// Déconnexion du compte utilisateur en partage.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le premier compte utilisateur partagé par l'utilisateur en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test4@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en lecture.
	await expect( page.getByRole( "cell", { name: "duck" } ) ).toHaveCount( 1 );

	// Vérification de l'absence du bouton de partage du fichier partagé en lecture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).toBeDisabled();
} );

//
// Partage d'un fichier en écriture et renommage par l'utilisateur partagé.
//
test( "Partage d'un fichier en écriture pour renommage", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 2 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test3@gmail.com" );

	// Recherche et ajout d'un utilisateur pour le partage en écriture.
	await page
		.locator( "li" )
		.filter( { hasText: "test3@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Modification des permissions de partage pour l'utilisateur en écriture.
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test3@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en écriture.
	await expect( page.getByRole( "cell", { name: "fox" } ) ).toHaveCount( 1 );

	// Vérification de la présence du bouton de partage du fichier partagé en écriture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).not.toBeDisabled();

	// Renommage du fichier partagé en écriture.
	await page.getByRole( "menuitem", { name: "Rename Resource" } ).click();
	await page.getByPlaceholder( "fox" ).fill( "fux" );
	await page.getByRole( "button", { name: "Update" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la présence du fichier renommé partagé en écriture.
	await expect( page.getByRole( "cell", { name: "fux" } ) ).toHaveCount( 1 );

	// Déconnexion du compte utilisateur en partage.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partageant le fichier.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier renommé partagé en écriture.
	await expect( page.getByRole( "cell", { name: "fux" } ) ).toHaveCount( 1 );
} );

//
// Partage d'un fichier en écriture et suppression par l'utilisateur partagé.
//
test( "Partage d'un fichier en écriture pour suppression", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 4 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test4@gmail.com" );

	// Recherche et ajout d'un utilisateur pour le partage en écriture.
	await page
		.locator( "li" )
		.filter( { hasText: "test4@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Modification des permissions de partage pour l'utilisateur en écriture.
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test4@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en écriture.
	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 1 );

	// Vérification de la présence du bouton de partage du fichier partagé en écriture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).not.toBeDisabled();

	// Suppression du fichier partagé en écriture.
	await page.getByRole( "menuitem", { name: "Permanently Delete" } ).click();
	await page.getByRole( "button", { name: "Confirm" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de l'absence du fichier supprimé et partagé en écriture.
	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 0 );

	// Déconnexion du compte utilisateur en partage.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partageant le fichier.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test1@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de l'absence du fichier supprimé et partagé en écriture.
	await expect( page.getByRole( "cell", { name: "seagull" } ) ).toHaveCount( 0 );
} );

//
// Partage d'un fichier en écriture et ajout d'une nouvelle version par l'utilisateur partagé.
//
test( "Partage d'un fichier en écriture pour versionnage", async ( { page } ) =>
{
	// Ouverture du menu des actions et ouverture du gestionnaire de partages.
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 3 ).click();
	await page.getByRole( "menuitem", { name: "Manage Shares" } ).click();
	await page.getByPlaceholder( "Search..." ).fill( "test5@gmail.com" );

	// Recherche et ajout d'un utilisateur pour le partage en écriture.
	await page
		.locator( "li" )
		.filter( { hasText: "test5@gmail.com" } )
		.getByRole( "button" )
		.click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Modification des permissions de partage pour l'utilisateur en écriture.
	await page.getByRole( "combobox" ).click();
	await page.getByLabel( "Write" ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 2 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Ouverture de la fenêtre de dialogue pour ajouter une nouvelle version du fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.locator( "input[type = file]" )
		.setInputFiles( [ join( __dirname, "static/duplication/raccoon.jpg" ) ] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Accès aux révisions et vérification de la présence de la nouvelle version.
	await page.getByRole( "button", { name: "Open action menu" } ).nth( 3 ).click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Déconnexion du compte utilisateur actuel.
	await page.locator( "header aside button:last-of-type" ).click();
	await page.getByText( "Logout" ).click();
	await expect( page ).toHaveURL( "/" );

	// Connexion avec le compte utilisateur partagé en écriture.
	await page.goto( "/authentication" );
	await page.getByRole( "tab", { name: "Login" } ).click();
	await page.getByPlaceholder( "name@domain.com" ).fill( "test5@gmail.com" );
	await page.getByPlaceholder( "@MyPassword123!" ).fill( "Florian4016" );
	await page.getByText( "Log in by password" ).click();
	await expect( page ).toHaveURL( "/dashboard" );

	// Vérification de la présence du fichier partagé en écriture.
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 1 );

	// Vérification de la présence du bouton de partage du fichier partagé en écriture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await expect(
		page.getByRole( "menuitem", { name: "Make Public" } )
	).not.toBeDisabled();

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Ouverture de la fenêtre de dialogue pour ajouter un nouveau fichier.
	await page.locator( "button" ).filter( { hasText: "Add a file" } ).click();
	await page
		.locator( "input[type = file]" )
		.setInputFiles( [ join( __dirname, "static/duplication/raccoon.jpg" ) ] );
	await page.locator( "button" ).filter( { hasText: "Upload" } ).click();
	await expect(
		page.locator( "[data-sonner-toast][data-type = success]" )
	).toHaveCount( 1 );

	// Rechargement de la page pour fermer le menu des actions.
	//  Source : https://github.com/radix-ui/primitives/issues/1836#issuecomment-1674338372
	await page.reload();

	// Vérification de la présence du fichier partagé en écriture.
	await expect( page.getByRole( "cell", { name: "raccoon" } ) ).toHaveCount( 2 );

	// Accès aux révisions et vérification de la présence des deux versions
	//  du fichier partagé en écriture.
	await page
		.getByRole( "button", { name: "Open action menu" } )
		.first()
		.click();
	await page.getByRole( "menuitem", { name: "View Revisions" } ).click();

	await expect( page.getByText( "55.79 KB", { exact: true } ) ).toHaveCount( 1 );
	await expect( page.getByText( "-97.77 KB" ) ).toHaveCount( 1 );
} );