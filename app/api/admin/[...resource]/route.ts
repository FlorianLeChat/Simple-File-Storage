//
// Route pour les requêtes de React Admin vers la base de données.
//
import prisma from "@/utilities/prisma";
import { auth } from "@/utilities/next-auth";
import { NextResponse } from "next/server";
import { type RaPayload, defaultHandler } from "ra-data-simple-prisma";

const handler = async ( request: Request ) =>
{
	// On vérifie d'abord la session de l'utilisateur.
	const session = await auth();

	if ( !session || session.user.role !== "admin" )
	{
		return new NextResponse( null, { status: 403 } );
	}

	try
	{
		// On tente ensuite d'effectuer la requête.
		const result = await defaultHandler(
			( await request.json() ) as RaPayload,
			prisma
		);

		// On retourne alors le résultat en format JSON.
		return NextResponse.json( result );
	}
	catch
	{
		// En cas d'erreur, on retourne enfin une erreur HTTP pour
		//  indiquer que la requête a échouée.
		return new NextResponse( null, { status: 400 } );
	}
};

export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as PATCH,
	handler as DELETE
};