//
// Route pour la récupération des données de l'utilisateur en session.
//  Source : https://github.com/amannn/next-intl/issues/596
//
import { auth } from "@/utilities/next-auth";
import { NextResponse } from "next/server";

export async function GET()
{
	const session = await auth();

	if ( !session )
	{
		// La session n'existe pas, on retourne une erreur 403.
		return new NextResponse( null, { status: 403 } );
	}

	// La session existe, on retourne les données de l'utilisateur.
	return NextResponse.json( session.user );
}