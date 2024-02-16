//
// Route pour la récupération des notifications de l'utilisateur.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { NextResponse } from "next/server";

export async function GET()
{
	// On vérifie si l'utilisateur est connecté afin de récupérer
	//  ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On récupère ensuite l'ensemble des notifications de l'utilisateur
	//  tout en limitant le nombre de résultats à 50.
	const notifications = await prisma.notification.findMany( {
		where: {
			userId: session.user.id
		},
		take: 50
	} );

	// On retourne enfin les notifications sous forme de réponse JSON.
	return NextResponse.json( notifications );
}