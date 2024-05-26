//
// Permet de compresser des images en fonction de son extension avec Sharp.
//  Source : https://sharp.pixelplumbing.com/api-resize
//
import sharp from "sharp";
import { logger } from "./pino";

// Qualité de compression des images.
//  Note : plus la valeur est élevée, plus la qualité est élevée.
const COMPRESSION_QUALITY = 50;

export async function compressFile(
	buffer: Uint8Array,
	extension: string
): Promise<Uint8Array>
{
	// On créé d'abord une instance de sharp avec la mémoire tampon.
	const instance = sharp( buffer );
	instance.keepExif();

	// On compresse l'image en fonction de son extension.
	switch ( extension )
	{
		case "jpg" || "jpeg":
			// https://sharp.pixelplumbing.com/api-output#jpeg
			instance.jpeg( { quality: COMPRESSION_QUALITY } );
			break;
		case "png":
			// https://sharp.pixelplumbing.com/api-output#png
			instance.png( { quality: COMPRESSION_QUALITY } );
			break;
		case "webp":
			// https://sharp.pixelplumbing.com/api-output#webp
			instance.webp( { quality: COMPRESSION_QUALITY } );
			break;
		case "tiff":
			// https://sharp.pixelplumbing.com/api-output#tiff
			instance.tiff( { quality: COMPRESSION_QUALITY } );
			break;
		case "avif":
			// https://sharp.pixelplumbing.com/api-output#avif
			instance.avif( { quality: COMPRESSION_QUALITY } );
			break;
		default:
			// Si l'extension n'est pas reconnue, on retourne la
			//  mémoire tampon telle quelle avant modification.
			return buffer;
	}

	// On retourne enfin la mémoire tampon compressée.
	const compressed = await instance.toBuffer();

	logger.info(
		{ source: __filename, before: buffer.length, after: compressed.length },
		"Compressing file"
	);

	return compressed;
}