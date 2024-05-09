//
// Route de récupération des fichiers dynamiques de l'application.
//
import { readFile } from "fs/promises";
import path, { sep } from "path";
import { existsSync } from "fs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
)
{
	// On vérifie d'abord si la requête courante est légitime et
	//  en provenance du serveur.
	if ( request.headers.get( "X-Auth-Secret" ) !== process.env.AUTH_SECRET )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On vérifie si le chemin demandé existe dans le système de fichiers.
	const filePath = path.join( process.cwd(), "public", params.path.join( sep ) );

	if ( !existsSync( filePath ) )
	{
		return new NextResponse( null, { status: 400 } );
	}

	try
	{
		// Si c'est le cas, on lit le contenu du fichier et on le renvoie.
		return new NextResponse( await readFile( filePath ) );
	}
	catch
	{
		// Dans le cas contraire, on renvoie enfin une erreur HTTP 500.
		return new NextResponse( null, { status: 500 } );
	}
}