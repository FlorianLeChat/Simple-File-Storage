//
// Ajout du support des vérifications CAPTCHA sur les actions côté serveur de NextJS.
//  Source : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
//

"use client";

import type { Challenge } from "altcha-lib/types";
import { solveChallengeWorkers } from "altcha-lib";

export default async function serverAction(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	action: ( _state: Record<string, unknown>, formData: FormData ) => Promise<any>,
	lastState: Record<string, unknown>,
	formData: FormData
)
{
	// Vérification de l'activation de la vérification CAPTCHA.
	if ( process.env.NEXT_PUBLIC_CAPTCHA_ENABLED !== "true" )
	{
		return action( lastState, formData );
	}

	// Récupération d'un défi CAPTCHA depuis l'API.
	const response = await fetch( "/api/captcha" );
	const json = ( await response.json() ) as Challenge;

	// Résolution du défi et obtention d'une solution.
	const solution = await solveChallengeWorkers(
		() => new Worker( new URL( "altcha-lib/worker", import.meta.url ) ),
		navigator.hardwareConcurrency,
		json.challenge,
		json.salt,
		json.algorithm,
		json.maxnumber
	);

	console.log( "Solving CAPTCHA challenge" );
	console.table( solution );

	// Transmission de la charge utile contenant la solution CAPTCHA.
	const payload = {
		salt: json.salt,
		number: solution?.number ?? 0,
		algorithm: json.algorithm,
		challenge: json.challenge,
		signature: json.signature
	};

	formData.append( "captcha", btoa( JSON.stringify( payload ) ) );

	return action( lastState, formData );
}