//
// Route pour la récupération des fichiers utilisateurs.
//  Source : https://github.com/prisma/prisma/discussions/12602
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { type NextRequest, NextResponse } from "next/server";

export async function GET( request: NextRequest )
{
	// On vérifie si l'utilisateur est connecté afin de récupérer
	//  ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On tente ensuite de récupérer la page demandée à partir
	//  des paramètres de l'URL.
	const page = request.nextUrl.searchParams.get( "p" );

	if ( !page )
	{
		// Si la page n'est pas définie, on redirige l'utilisateur
		//  vers la première page.
		const url = new URL( request.nextUrl.pathname, request.url );
		url.searchParams.set( "p", "1" );

		return NextResponse.redirect( url.href );
	}

	// On récupère après l'ensemble des fichiers de l'utilisateur
	//  tout en limitant le nombre de résultats à 10 par page.
	const files = await prisma.file.findMany( {
		where: {
			userId: session.user.id
		},
		take: 10,
		skip: ( Number( page ) - 1 ) * 10,
		include: {
			versions: {
				orderBy: {
					createdAt: "desc"
				}
			}
		}
	} );

	if ( !files )
	{
		logger.error( { source: __filename }, "Files not found" );

		return new NextResponse( null, { status: 400 } );
	}

	// On renvoie enfin les fichiers sous forme de réponse JSON.
	logger.debug( { source: __filename, files }, "Files retrieved" );

	return NextResponse.json( files );
}