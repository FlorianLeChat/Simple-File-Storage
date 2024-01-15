//
// Récupération de la taille d'un répertoire récursivement.
//  Source : https://stackoverflow.com/a/69418940
//
import { join } from "path";
import { readdir, stat } from "fs/promises";

export async function getDirectorySize( directory: string ): Promise<number>
{
	const files = await readdir( directory, { withFileTypes: true } );
	const folders = files.map( async ( file ) =>
	{
		const path = join( directory, file.name );

		if ( file.isDirectory() )
		{
			return getDirectorySize( path );
		}

		if ( file.isFile() )
		{
			return ( await stat( path ) ).size;
		}

		return 0;
	} );

	return ( await Promise.all( folders ) )
		.flat( Infinity )
		.reduce( ( i, size ) => i + size, 0 );
}