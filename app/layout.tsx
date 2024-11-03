//
// Importation statique des règles CSS transformées par Tailwind CSS.
//  Note : cette page ne devrait pas exister mais NextJS ne permet pas
//   de charger les règles CSS globales depuis des routes dynamiques...
//

import "./layout.css";
import "vanilla-cookieconsent/dist/cookieconsent.css";

import { logger } from "@/utilities/pino";
import type { ReactNode } from "react";
import { Inter, Poppins, Roboto } from "next/font/google";

const inter = Inter( {
	subsets: [ "latin" ],
	display: "swap"
} );

const poppins = Poppins( {
	weight: [ "100", "200", "300", "400", "500", "600", "700", "800", "900" ],
	subsets: [ "latin" ],
	display: "swap"
} );

const roboto = Roboto( {
	weight: [ "100", "300", "400", "500", "700", "900" ],
	subsets: [ "latin" ],
	display: "swap"
} );

export default function Layout( { children }: { children: ReactNode } )
{
	// Les polices de caractères sont chargées mais ne sont pas utilisées
	//  dans ce fichier, elles sont ainsi utilisées dans les routes dynamiques
	//  en appelant de nouveau ces mêmes fonctions car elles sont désormais en cache.
	logger.debug(
		{ source: __dirname, fonts: [ inter, poppins, roboto ] },
		"Fonts loaded"
	);

	return (
		<html>
			<body>{children}</body>
		</html>
	);
}