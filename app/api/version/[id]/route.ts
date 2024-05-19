//
// Route pour la récupération d'une version d'un fichier.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: { id: string } }
)
{
	// On vérifie si l'utilisateur est connecté afin de récupérer
	//  ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On récupère ensuite la version du fichier demandée.
	const version = await prisma.version.findUnique( {
		where: {
			id: params.id,
			file: {
				userId: session.user.id
			}
		}
	} );

	if ( !version )
	{
		// Si la version n'existe pas, on retourne une erreur.
		logger.debug( { source: __filename, id: params.id }, "Version not found" );

		return new NextResponse( null, { status: 400 } );
	}

	// Dans cas contraire, on retourne enfin les données de la version
	//  comme une réponse JSON.
	logger.debug( { source: __filename, version }, "Version retrieved" );

	return NextResponse.json( version );
}