//
// Création de comptes utilisateurs factices pour les tests e2e.
//

// Importation des dépendances.
import { join } from "path";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Configuration des variables d'environnement.
dotenv.config( { path: join( process.cwd(), ".env.local" ), override: true } );

// Exécution de la fonction asynchrone.
const script = async () =>
{
	// Création d'une nouvelle instance de Prisma et création
	//  d'un compte utilisateur factice.
	const prisma = new PrismaClient();

	// Suppression des anciens comptes utilisateurs factices.
	await prisma.user.deleteMany( {
		where: {
			email: {
				startsWith: "test"
			}
		}
	} );

	// Génération de 5 comptes utilisateurs factices.
	await prisma.user.createMany( {
		data: Array.from( [ 1, 2, 3, 4, 5 ], ( index ) => ( {
			name: faker.person.fullName(),
			email: `test${ index }@gmail.com`,
			password:
				"$2a$15$ztEyG.IzUf5mIO9kynUeoOZarLtxIRY7o.Eynzc501/MsrG6.DjGW"
		} ) )
	} );

	// Déconnexion de la base de données.
	prisma.$disconnect();
};

script();