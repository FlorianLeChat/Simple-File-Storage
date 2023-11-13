//
// Composant des sessions pour les mécanismes d'authentification.
//  Source : https://next-auth.js.org/getting-started/client#custom-base-path
//

"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function NextAuthProvider( {
	children
}: {
	children: ReactNode;
} )
{
	return (
		<SessionProvider basePath={process.env.__NEXT_ROUTER_BASEPATH}>
			{children}
		</SessionProvider>
	);
}