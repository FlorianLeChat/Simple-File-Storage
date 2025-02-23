// Types pour le cache de connexion à la base de données Prisma.
import { PrismaClient } from "@prisma/client";

declare global
{
	var prisma: PrismaClient;
}