//
// Route pour la récupération des versions d'un ou plusieurs fichiers.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id?: string[] } }
)
{
	// On vérifie si l'utilisateur est connecté afin de récupérer
	//  ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On vérifie si un identifiant de fichier est présent dans les
	//  paramètres de l'URL.
	if ( !params.id )
	{
		// Si ce n'est pas le cas, on tente de récupérer la page demandée
		//  à partir des paramètres de l'URL.
		const page = request.nextUrl.searchParams.get( "p" );

		if ( !page )
		{
			// Si la page n'est pas définie, on redirige l'utilisateur
			//  vers la première page.
			const url = new URL( request.nextUrl.pathname, request.url );
			url.searchParams.set( "p", "1" );

			return NextResponse.redirect( url.href );
		}

		// Dans le cas inverse, on récupère l'ensemble des versions
		//  des fichiers de l'utilisateur tout en limitant le nombre
		//  de résultats à 10 par page.
		const versions = await prisma.version.findMany( {
			where: {
				file: {
					userId: session.user.id
				}
			},
			take: 10,
			skip: ( Number( page ) - 1 ) * 10,
			orderBy: {
				createdAt: "desc"
			}
		} );

		if ( !versions )
		{
			return new NextResponse( null, { status: 400 } );
		}

		// On les renvoie ensuite sous forme de réponse JSON.
		return NextResponse.json( versions );
	}

	// Si un identifiant de fichier est présent dans les paramètres
	//  de l'URL, on récupère uniquement les versions de ce fichier.
	const versions = await prisma.version.findMany( {
		where: {
			file: {
				id: params.id[ 0 ],
				userId: session.user.id
			}
		}
	} );

	if ( !versions )
	{
		return new NextResponse( null, { status: 400 } );
	}

	// On retourne enfin les données de la version comme une réponse JSON.
	return NextResponse.json( versions );
}