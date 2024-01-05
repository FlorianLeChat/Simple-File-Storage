//
// Route pour la récupération des fichiers utilisateurs.
//  Source : https://github.com/prisma/prisma/discussions/12602
//
import prisma from "@/utilities/prisma";
import { parse } from "path";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
)
{
	// On récupère d'abord les informations du fichier
	//  à partir de son identifiant dans la base de données.
	const file = await prisma.file.findUnique( {
		where: {
			fileId: params.id
		}
	} );

	if ( !file )
	{
		// Si le fichier n'existe pas, on retourne une erreur 404.
		return new NextResponse( null, { status: 404 } );
	}

	// Dans le cas contraire, on vérifie ensuite si le fichier est
	//  public ou non.
	if ( file.status === "public" )
	{
		// Si le fichier est public, on retourne une redirection
		//  vers le fichier.
		return new NextResponse(
			new URL(
				`/files/${ file.userId }/${ file.fileId + parse( file.name ).ext }`,
				request.url
			).href
		);
	}

	// Sinon, on retourne enfin une erreur d'authentification.
	return new NextResponse( null, { status: 403 } );
}