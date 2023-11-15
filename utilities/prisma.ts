//
// Création d'une instance Prisma unique à travers les actualisations.
//  Source : https://vercel.com/guides/nextjs-prisma-postgres
//
import { PrismaClient } from "@prisma/client";

declare global {
	// Déclaration des variables globales.
	// eslint-disable-next-line vars-on-top, no-var
	var prisma: PrismaClient;
}

// Récupération et mise en mémoire du client Prisma.
// eslint-disable-next-line import/no-mutable-exports
let prisma: PrismaClient;

if ( process.env.NODE_ENV === "production" )
{
	prisma = new PrismaClient();
}
else
{
	if ( !global.prisma )
	{
		global.prisma = new PrismaClient();
	}

	prisma = global.prisma;
}

export default prisma;