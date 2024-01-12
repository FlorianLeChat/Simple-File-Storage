//
// Conversion d'une taille de fichier en une chaîne de caractères.
//  Source : https://stackoverflow.com/q/10420352
//
const units = [ "B", "KB", "MB", "GB", "TB" ];

export function formatSize( raw: number ): string
{
	let index = 0;
	let size = Math.abs( raw );

	while ( size >= 1024 && index < units.length - 1 )
	{
		size /= 1024;
		index++;
	}

	return `${ Number( size.toFixed( 2 ) ).toLocaleString() } ${ units[ index ] }`;
}