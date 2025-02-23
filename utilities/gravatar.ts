//
// Récupère l'URL Gravatar d'une adresse électronique quelconque.
//  Source : https://docs.gravatar.com/api/avatars/node/
//
export const getGravatarUrl = async ( email: string, size = 64 ) =>
{
	const messageBuffer = new TextEncoder().encode( email.trim().toLowerCase() );
	const hashBuffer = await crypto.subtle.digest( "SHA-256", messageBuffer );
	const hashArray = Array.from( new Uint8Array( hashBuffer ) );
	const hashHex = hashArray
		.map( ( b ) => b.toString( 16 ).padStart( 2, "0" ) )
		.join( "" );

	return `https://www.gravatar.com/avatar/${ hashHex }?s=${ size }&d=identicon`;
};