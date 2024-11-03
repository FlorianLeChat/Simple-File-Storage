//
// Route pour la récupération d'un fichier utilisateur.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	data: { params: Promise<{ id: string }> }
)
{
	// On récupère d'abord les informations du fichier à partir
	//  de son identifiant dans la base de données et de la version
	//  demandée dans les paramètres de l'URL.
	const version = request.nextUrl.searchParams.get( "v" );
	const params = await data.params;
	const file = await prisma.file.findUnique( {
		where: {
			id: params.id
		},
		include: {
			shares: true,
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
		logger.error( { source: __dirname, id: params.id }, "File not found" );

		return new NextResponse( null, { status: 400 } );
	}

	// On vérifie également le statut de partage du fichier pour savoir
	//   s'il est possible d'y accéder.
	switch ( file.status )
	{
		case "public": {
			// Si le fichier est public, on retourne les données du fichier
			//  comme une réponse JSON sans aucune vérification.
			logger.debug( { source: __dirname, file }, "Public file retrieved" );

			return NextResponse.json( file );
		}

		case "private": {
			// Si le fichier est privé, on vérifie d'abord si l'utilisateur
			//  est connecté afin de récupérer ses informations.
			const session = await auth();

			if ( !session )
			{
				return new NextResponse( null, { status: 403 } );
			}

			// On retourne ensuite les données du fichier si l'utilisateur
			//  semble posséder les autorisations d'accès en partage.
			if ( file.shares.some( ( share ) => share.userId === session.user.id ) )
			{
				logger.debug(
					{ source: __dirname, file },
					"Shared file retrieved"
				);

				return NextResponse.json( file );
			}

			// Si le fichier n'est pas partagé, on récupère la session
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
			logger.debug(
				{ source: __dirname, file },
				"Private file retrieved"
			);

			return NextResponse.json( file );
		}

		default: {
			// Quand aucun statut n'est défini, on retourne enfin une
			//  erreur 404.
			return new NextResponse( null, { status: 404 } );
		}
	}
}