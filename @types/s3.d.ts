// Types pour le cache de connexion à une instance S3.
import type { S3Client } from "@aws-sdk/client-s3";

declare global {
	var s3: S3Client;
}