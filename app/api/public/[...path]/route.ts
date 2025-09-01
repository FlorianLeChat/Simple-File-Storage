//
// Route de récupération des fichiers dynamiques de l'application.
//
import { logger } from "@/utilities/pino";
import { readFile } from "fs/promises";
import path, { sep } from "path";
import { existsSync } from "fs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	data: { params: Promise<{ path: string[] }> }
)
{
	// On vérifie d'abord si la requête courante est légitime et
	//  en provenance du serveur.
	const secret = request.headers.get( "X-Auth-Secret" );

	if ( secret !== process.env.AUTH_SECRET )
	{
		logger.error(
			{ source: __dirname, secret },
			"Unauthorized access to public files"
		);

		return new NextResponse( null, { status: 403 } );
	}

	// On vérifie si le chemin demandé existe dans le système de fichiers.
	const params = await data.params;
	const filePath = path.join( process.cwd(), "public", params.path.join( sep ) );

	if ( !existsSync( filePath ) )
	{
		logger.debug( { source: __dirname, path: filePath }, "File not found" );

		return new NextResponse( null, { status: 400 } );
	}

	try
	{
		// Si c'est le cas, on lit le contenu du fichier et on le renvoie.
		return new NextResponse( Buffer.from( await readFile( filePath ) ) );
	}
	catch ( error )
	{
		// Dans le cas contraire, on renvoie enfin une erreur HTTP 500.
		logger.error( { source: __dirname, error }, "Error reading public file" );

		return new NextResponse( null, { status: 500 } );
	}
}