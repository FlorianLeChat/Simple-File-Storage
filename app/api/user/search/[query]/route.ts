//
// Route pour la recherche d'utilisateurs via leur nom ou leur adresse électronique.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { logger } from "@/utilities/pino";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	data: { params: Promise<{ query: string }> }
)
{
	// On vérifie si l'utilisateur est connecté afin de récupérer
	//  ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On récupère ensuite tous les utilisateurs dont le nom ou l'adresse
	//  électronique contient la chaîne de caractères demandée.
	const params = await data.params;
	const users = await prisma.user.findMany( {
		where: {
			OR: [
				{
					name: {
						contains: params.query
					}
				},
				{
					email: {
						contains: params.query
					}
				}
			],
			AND: [
				{
					id: {
						not: session.user.id
					}
				}
			]
		},
		take: 10
	} );

	// On retourne enfin les données des utilisateurs comme une réponse JSON.
	const results = users.map( ( user ) => ( {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image
	} ) );

	logger.debug( { source: __filename, results }, "Users found" );

	return NextResponse.json( results );
}