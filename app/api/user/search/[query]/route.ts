//
// Route pour la recherche d'utilisateurs via leur nom ou leur adresse électronique.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: { query: string } }
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
	return NextResponse.json(
		users.map( ( user ) => ( {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image
		} ) )
	);
}