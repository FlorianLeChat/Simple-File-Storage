// Types pour les propriétés personnalisées des sessions et des utilisateurs.
// Source : https://next-auth.js.org/getting-started/typescript#module-augmentation
import type { DefaultSession, User } from "next-auth";

declare module "@auth/core/types" {
	interface Session {
		user: {
			id: string;
			role: string;
			oauth: boolean;
			preferences: {
				font: string;
				theme: string;
				color: string;
				public: boolean;
				extension: boolean;
				versions: boolean;
			};
			notification: string;
		} & DefaultSession["user"];
	}
}

// Correctifs pour les différences entre les types d'adaptateurs.
// Sources : https://github.com/nextauthjs/next-auth/issues/6640 et https://github.com/nextauthjs/next-auth/issues/7003
declare module "@auth/core/adapters" {
	interface AdapterUser extends User {
		// Propriétés par défaut.
		id: string;
		email: string;
		password: string;
		emailVerified?: Date;

		// Propriétés personnalisées.
		role: string;
		preferences?: {
			font: string;
			theme: string;
			color: string;
			public: boolean;
			extension: boolean;
			versions: boolean;
		};
		notification: string;
	}
}