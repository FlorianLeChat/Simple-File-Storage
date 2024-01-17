//
// Route pour la récupération des fichiers utilisateurs.
//  Source : https://github.com/prisma/prisma/discussions/12602
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id?: string[] } }
)
{
	// On vérifie d'abord si l'identifiant du fichier est fourni
	//  dans les paramètres de l'URL.
	if ( !params.id )
	{
		// Si n'est pas le cas, on vérifie si l'utilisateur est
		//  connecté afin de récupérer ses fichiers.
		const session = await auth();

		if ( !session )
		{
			return new NextResponse( null, { status: 400 } );
		}

		// On tente de récupérer la page demandée à partir des
		//  paramètres de l'URL.
		const page = request.nextUrl.searchParams.get( "p" );

		if ( !page )
		{
			// Si la page n'est pas définie, on redirige l'utilisateur
			//  vers la première page.
			const url = new URL( request.nextUrl.pathname, request.url );
			url.searchParams.set( "p", "1" );

			return NextResponse.redirect( url.href );
		}

		// On récupère l'ensemble des fichiers de l'utilisateur
		//  tout en limitant le nombre de résultats à 10 par page
		//  avant de les renvoyer sous forme de réponse JSON.
		return NextResponse.json(
			await prisma.file.findMany( {
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
			} )
		);
	}

	// On récupère les informations du fichier à partir de son
	//  identifiant dans la base de données et de la version
	//  demandée dans les paramètres de l'URL.
	const version = request.nextUrl.searchParams.get( "v" );
	const file = await prisma.file.findUnique( {
		where: {
			id: params.id[ 0 ]
		},
		include: {
			versions: {
				where: {
					id: version ?? undefined
				},
				orderBy: {
					createdAt: "desc"
				}
			}
		}
	} );

	if ( !file || file.versions.length === 0 )
	{
		return new NextResponse( null, { status: 400 } );
	}

	// On vérifie le statut de partage du fichier pour savoir s'il
	//  est possible d'y accéder.
	switch ( file.status )
	{
		case "public": {
			// Si le fichier est public, on retourne les données du fichier
			//  comme une réponse JSON sans aucune vérification.
			return NextResponse.json( file );
		}

		case "private": {
			// Si le fichier est privé, on récupère d'abord la session
			//  de l'utilisateur pour vérifier si c'est bien lui qui
			//  a téléversé le fichier.
			const session = await auth();

			if ( !session )
			{
				// Lorsque la session n'existe pas, on retourne une
				//  erreur d'authentification.
				return new NextResponse( null, { status: 403 } );
			}

			if ( session.user.id === file.userId )
			{
				// Lorsque la session existe et que l'utilisateur
				//  est bien le propriétaire du fichier, on retourne
				//  les données du fichier comme une réponse JSON.
				return NextResponse.json( file );
			}

			// Dans le cas contraire, on retourne une erreur
			//  d'authentification.
			return new NextResponse( null, { status: 403 } );
		}

		default: {
			// Quand aucun statut n'est défini, on retourne une
			//  erreur 404.
			return new NextResponse( null, { status: 404 } );
		}
	}
}