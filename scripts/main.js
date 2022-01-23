// Permet de déterminer si une chaîne de caractères est valide.
function isEmpty( str )
{
	return ( !str || str.trim().length === 0 );
}

// Permet de faire une première vérification du mot de passe.
// Note : ceci doit s'appliquer seulement sur la page principale.
if ( document.URL == "https://files.florian-dev.fr/" )
{
	const form = document.querySelector( "form" );

	form.addEventListener( "submit", function ( event )
	{
		const password = document.getElementsByName( "password" )[ 0 ].value;

		if ( !isEmpty( password ) )
			return;

		alert( "Vous devez renseigner un mot de passe pour utiliser ce service !" );
		event.preventDefault();
	}, true );
}