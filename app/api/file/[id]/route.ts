//
// Route pour la récupération d'un fichier utilisateur.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
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

	// On récupère ensuite les informations du fichier à partir
	//  de son identifiant dans la base de données et de la version
	//  demandée dans les paramètres de l'URL.
	const version = request.nextUrl.searchParams.get( "v" );
	const file = await prisma.file.findUnique( {
		where: {
			id: params.id
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

	// On vérifie ensuite le statut de partage du fichier pour savoir
	//   s'il est possible d'y accéder.
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
			if ( !session || session.user.id !== file.userId )
			{
				// Lorsque la session n'existe pas ou que l'utilisateur
				//  n'est pas le propriétaire du fichier, on retourne
				//  une erreur d'authentification.
				return new NextResponse( null, { status: 403 } );
			}

			// Dans le cas contraire, on retourne les données du fichier
			//  comme une réponse JSON.
			return NextResponse.json( file );
		}

		default: {
			// Quand aucun statut n'est défini, on retourne enfin une
			//  erreur 404.
			return new NextResponse( null, { status: 404 } );
		}
	}
}