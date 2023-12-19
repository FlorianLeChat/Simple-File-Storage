// Types pour le cache de connexion à la base de données MongoDB.
// Source : https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html
import prisma from "@prisma/client";

export const client: prisma.PrismaClient;
export as namespace prisma;