//
// Route pour le téléversement d'un avatar d'utilisateur dans une instance S3.
//  Source : https://vercel.com/guides/how-can-i-use-aws-s3-with-vercel
//
import S3 from "@/utilities/s3";
import { auth } from "@/utilities/next-auth";
import { NextResponse } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";

export async function GET()
{
	// On vérifie tout d'abord si les services S3 sont activés.
	if ( process.env.S3_ENABLED !== "true" )
	{
		return new NextResponse( null, { status: 501 } );
	}

	// On vérifie ensuite si l'utilisateur est connecté afin de
	//  récupérer ses informations.
	const session = await auth();

	if ( !session )
	{
		return new NextResponse( null, { status: 403 } );
	}

	// On applique après la configuration CORS pour l'instance S3.
	//  Source : https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_PutBucketCors_section.html
	const command = new PutBucketCorsCommand( {
		Bucket: process.env.S3_BUCKET_NAME ?? "",
		CORSConfiguration: {
			CORSRules: [
				{
					MaxAgeSeconds: 3600,
					ExposeHeaders: [
						"ETag",
						"Content-Type",
						"Access-Control-Allow-Origin"
					],
					AllowedHeaders: [ "*" ],
					AllowedMethods: [ "GET", "HEAD", "PUT", "POST", "DELETE" ],
					AllowedOrigins: [
						"http://localhost:*",
						"https://*.florian-dev.fr"
					]
				}
			]
		}
	} );

	await S3.send( command );

	// On créé alors une URL de téléversement pour l'avatar de
	//  l'utilisateur avec certaines conditions.
	//  Source : https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html
	const { url, fields } = await createPresignedPost( S3, {
		Key: `avatars/${ session.user.id }`,
		Bucket: process.env.S3_BUCKET_NAME ?? "",
		Fields: {
			acl: "public-read"
		},
		Expires: 300,
		Conditions: [
			[
				// Taille minimale et maximale de l'image.
				"content-length-range",
				0,
				Number( process.env.NEXT_PUBLIC_MAX_AVATAR_SIZE ?? 0 )
			],
			[
				// Type de l'image.
				"eq",
				"$Content-Type",
				process.env.NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES ?? ""
			]
		]
	} );

	// On retourne enfin les données de téléversement sous format
	//  JSON pour que le client puisse les utiliser.
	return Response.json( { url, fields } );
}