//
// Création d'une instance Prisma unique à travers les actualisations.
//  Source : https://vercel.com/guides/nextjs-prisma-postgres
//
import { PrismaClient } from "@prisma/client";

// Récupération et mise en mémoire du client Prisma.
let cache: PrismaClient;

if ( process.env.NODE_ENV === "production" )
{
	cache = new PrismaClient();
}
else
{
	if ( !global.prisma )
	{
		global.prisma = new PrismaClient();
	}

	cache = global.prisma;
}

// Exportation du client Prisma.
const client: PrismaClient = cache;
export default client;