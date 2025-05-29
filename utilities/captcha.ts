//
// Mécanisme de génération et de validation d'un jeton CAPTCHA via Altcha.
//  Source : https://altcha.org/docs/v2/server-integration/#libraries
//
import { logger } from "./pino";
import type { Payload } from "altcha-lib/types";
import { NextResponse, type NextRequest } from "next/server";
import { createChallenge, verifySolution } from "altcha-lib";

const solutions: Record<string, string> = {}; // https://altcha.org/docs/v2/security-recommendations/#replay-attacks

const CAPTCHA_MAX_NUMBER = 100_000;
const CAPTCHA_EXPIRATION = 60 * 1000; // 1 minute.

const generateRandomHex = ( length: number ): string =>
{
	// Génère un tableau d'octets aléatoires de la longueur spécifiée
	//  et les convertit en une chaîne hexadécimale.
	const values = crypto.getRandomValues( new Uint8Array( length ) );
	const data = Array.from( values, ( byte ) =>
		byte.toString( 16 ).padStart( 2, "0" )
	);

	return data.join( "" );
};

export async function generateCaptcha(): Promise<NextResponse | undefined>
{
	try
	{
		const salt = generateRandomHex( 32 );
		const duration = Date.now() + CAPTCHA_EXPIRATION;
		const challenge = await createChallenge( {
			salt,
			expires: new Date( duration ),
			hmacKey: process.env.AUTH_SECRET ?? "",
			maxNumber: CAPTCHA_MAX_NUMBER
		} );

		logger.debug(
			{ source: __dirname, challenge },
			"Generated CAPTCHA challenge"
		);

		return NextResponse.json( challenge );
	}
	catch ( error )
	{
		if ( error instanceof Error && error.message )
		{
			logger.error(
				{ source: __dirname, message: error.message },
				"Failed to generate CAPTCHA challenge"
			);

			return new NextResponse( error.message, { status: 500 } );
		}
	}
}

export async function checkCaptcha( request: NextRequest ): Promise<NextResponse | undefined>
{
	let solution;

	try
	{
		const formData = await request.formData();
		solution = formData.get( "1_captcha" );

		logger.debug(
			{ source: __dirname, solution },
			"Received CAPTCHA solution"
		);
	}
	catch
	{
		return new NextResponse( null, { status: 400 } );
	}

	if ( !solution )
	{
		return new NextResponse( null, { status: 400 } );
	}

	try
	{
		const decodedSolution = atob( solution.toString() );
		const parsedPayload = JSON.parse( decodedSolution ) as Payload;

		if ( solutions[ parsedPayload.challenge ] )
		{
			// Vérifie si la solution a déjà été utilisée.
			logger.error(
				{ source: __dirname, payload: parsedPayload },
				"CAPTCHA solution already used"
			);

			return new NextResponse( null, { status: 409 } );
		}

		const verified = await verifySolution(
			parsedPayload,
			process.env.AUTH_SECRET ?? ""
		);

		if ( !verified )
		{
			// Vérifie si la solution est valide.
			logger.error(
				{ source: __dirname },
				"CAPTCHA solution verification failed"
			);

			return new NextResponse( null, { status: 400 } );
		}

		logger.debug(
			{ source: __dirname },
			"CAPTCHA solution verified successfully"
		);

		// Enregistre la solution pour éviter les attaques par relecture.
		solutions[ parsedPayload.challenge ] = `${ parsedPayload.number }`;
	}
	catch ( error )
	{
		if ( error instanceof Error && error.message )
		{
			logger.debug(
				{ source: __dirname, message: error.message },
				"Failed to verify CAPTCHA solution"
			);

			return new NextResponse( error.message, { status: 500 } );
		}
	}
}