//
// Types pour les variables d'environnement avec le validateur Zod.
//  Source : https://github.com/t3-oss/t3-env/blob/ac21b7ad1ebfb3958dec6d32cd32b716518c0e43/examples/nextjs/app/env.ts
//
import { z } from "zod";

const schema = z.object( {
	TZ: z.string().min( 1 ),
	NEXT_PUBLIC_ENV: z.enum( [ "development", "production" ] ),
	NEXT_PUBLIC_MAX_QUOTA: z.string().min( 1 ),
	NEXT_PUBLIC_MAX_AVATAR_SIZE: z.string().min( 1 ),
	NEXT_PUBLIC_ACCEPTED_FILE_TYPES: z.string().min( 1 ),
	NEXT_PUBLIC_ACCEPTED_AVATAR_TYPES: z.string().min( 1 ),

	SENTRY_ENABLED: z.enum( [ "true", "false" ] ),
	SENTRY_DSN: z.string().url(),
	SENTRY_ORG: z.string().min( 1 ),
	SENTRY_PROJECT: z.string().min( 1 ),
	SENTRY_AUTH_TOKEN: z.string().min( 1 ),

	NEXT_PUBLIC_RECAPTCHA_ENABLED: z.enum( [ "true", "false" ] ),
	NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY: z.string().length( 40 ).startsWith( "6L" ),
	RECAPTCHA_SECRET_KEY: z.string().length( 40 ).startsWith( "6L" ),

	NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum( [ "true", "false" ] ),
	NEXT_PUBLIC_ANALYTICS_TAG: z.string().length( 12 ).startsWith( "G-" ),

	DATABASE_URL: z.string().url(),

	SMTP_HOST: z.string().min( 1 ),
	SMTP_PORT: z.string().min( 1 ).max( 5 ),
	SMTP_USERNAME: z.string().min( 1 ),
	SMTP_PASSWORD: z.string().min( 1 ),

	DKIM_DOMAIN: z.string().min( 1 ),
	DKIM_SELECTOR: z.string().min( 1 ),
	DKIM_PRIVATE_KEY: z.string().min( 1 ),

	AUTH_SECRET: z.string().min( 1 ),

	NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z.enum( [ "true", "false" ] ),
	AUTH_GOOGLE_ID: z.string().min( 1 ),
	AUTH_GOOGLE_SECRET: z.string().min( 1 ),

	NEXT_PUBLIC_AUTH_GITHUB_ENABLED: z.enum( [ "true", "false" ] ),
	AUTH_GITHUB_ID: z.string().min( 1 ),
	AUTH_GITHUB_SECRET: z.string().min( 1 )
} );

schema.parse( process.env );

// Exportation des types pour les variables d'environnement.
export interface ProcessEnv extends z.infer<typeof schema> {}