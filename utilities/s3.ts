//
// Création d'une instance S3 unique à travers les actualisations.
//  Source : https://vercel.com/guides/how-can-i-use-aws-s3-with-vercel
//
import { S3Client } from "@aws-sdk/client-s3";

// Définition des paramètres de connexion à S3.
const options = {
	region: process.env.S3_REGION ?? "",
	endpoint: process.env.S3_ENDPOINT ?? "",
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
	}
};

// Récupération et mise en mémoire du client S3.
let cache: S3Client;

if ( process.env.NODE_ENV === "production" )
{
	cache = new S3Client( options );
}
else
{
	if ( !global.s3 )
	{
		global.s3 = new S3Client( options );
	}

	cache = global.s3;
}

// Exportation du client S3.
const client: S3Client = cache;
export default client;