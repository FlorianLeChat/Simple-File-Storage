//
// Route pour la récupération des fichiers utilisateurs.
//  Source : https://github.com/prisma/prisma/discussions/12602
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { parse } from "path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
)
{
	// On récupère d'abord les informations du fichier
	//  à partir de son identifiant dans la base de données.
	const version = await prisma.version.findFirst( {
		where: {
			fileId: params.id
		},
		include: {
			file: true
		},
		orderBy: {
			createdAt: "desc"
		}
	} );

	if ( !version )
	{
		// Si le fichier n'existe pas, on retourne une erreur 404.
		return new NextResponse( null, { status: 404 } );
	}

	// On tente de récupérer l'identifiant unique de la version
	//  à partir des paramètres de l'URL ou via la dernière version
	//  du fichier fournie par la base de données.
	const identifier =
		request.nextUrl.searchParams.get( "version" ) ?? version.id;
	const { file } = version;
	const url = new URL(
		`${ process.env.__NEXT_ROUTER_BASEPATH }/files/${ file.userId }/${
			file.id
		}/${ identifier + parse( file.name ).ext }`,
		request.url
	).href;

	// On vérifie le statut de partage du fichier pour savoir s'il
	//  est possible d'y accéder.
	switch ( file.status )
	{
		case "public": {
			// Si le fichier est public, on retourne une redirection
			//  vers le fichier sans aucune vérification.
			return new NextResponse( url );
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
				//  une redirection vers le fichier comme pour un
				//  fichier public.
				return new NextResponse( url );
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