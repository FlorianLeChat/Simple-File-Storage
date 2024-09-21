// Types pour les propriétés personnalisées des sessions et des utilisateurs.
// Source : https://next-auth.js.org/getting-started/typescript#module-augmentation
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
	// Types relatifs aux utilisateurs.
	interface User {
		id: string;
		role: string;
		image?: string;
		password?: password;
		notification: string;
		emailVerified: Date | null;
	}

	// Types relatifs aux sessions.
	interface Session {
		user: {} & JWT;
		expires: ISODateString;
	}
}

declare module "next-auth/jwt" {
	// Types relatifs aux jetons JWT.
	export interface JWT {
		id: string;
		role: string;
		oauth: boolean;
		image?: string;
		preferences: {
			font: string;
			theme: string;
			color: string;
			public: boolean;
			extension: boolean;
			versions: boolean;
			default?: boolean;
		};
		notification: string;
	}
}