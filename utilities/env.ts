//
// Types pour les variables d'environnement avec le validateur Valibot.
//  Source : https://github.com/t3-oss/t3-env/blob/ac21b7ad1ebfb3958dec6d32cd32b716518c0e43/examples/nextjs/app/env.ts
//
import * as v from "valibot";

const schema = v.object( {
	TZ: v.pipe( v.string(), v.minLength( 1 ) ),
	NEXT_LOGGING: v.picklist( [ "true", "false" ] ),
	NEXT_PUBLIC_ENV: v.picklist( [ "development", "production" ] ),
	NEXT_PUBLIC_MAX_QUOTA: v.pipe( v.string(), v.minLength( 1 ) ),
	NEXT_PUBLIC_ACCEPTED_FILE_TYPES: v.pipe( v.string(), v.minLength( 1 ) ),

	SENTRY_ENABLED: v.picklist( [ "true", "false" ] ),
	SENTRY_DSN: v.pipe( v.string(), v.url() ),
	SENTRY_ORG: v.pipe( v.string(), v.minLength( 1 ) ),
	SENTRY_PROJECT: v.pipe( v.string(), v.minLength( 1 ) ),
	SENTRY_AUTH_TOKEN: v.pipe( v.string(), v.minLength( 1 ) ),

	NEXT_PUBLIC_ANALYTICS_ENABLED: v.picklist( [ "true", "false" ] ),
	NEXT_PUBLIC_ANALYTICS_TAG: v.pipe(
		v.string(),
		v.length( 12 ),
		v.startsWith( "G-" )
	),

	DATABASE_URL: v.pipe( v.string(), v.url() ),

	SMTP_HOST: v.pipe( v.string(), v.minLength( 1 ) ),
	SMTP_PORT: v.pipe( v.string(), v.minLength( 1 ), v.maxLength( 5 ) ),
	SMTP_USERNAME: v.pipe( v.string(), v.minLength( 1 ) ),
	SMTP_PASSWORD: v.pipe( v.string(), v.minLength( 1 ) ),

	DKIM_DOMAIN: v.pipe( v.string(), v.minLength( 1 ) ),
	DKIM_SELECTOR: v.pipe( v.string(), v.minLength( 1 ) ),
	DKIM_PRIVATE_KEY: v.pipe( v.string(), v.minLength( 1 ) ),

	AUTH_SECRET: v.pipe( v.string(), v.minLength( 1 ) ),

	NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: v.picklist( [ "true", "false" ] ),
	AUTH_GOOGLE_ID: v.pipe( v.string(), v.minLength( 1 ) ),
	AUTH_GOOGLE_SECRET: v.pipe( v.string(), v.minLength( 1 ) ),

	NEXT_PUBLIC_AUTH_GITHUB_ENABLED: v.picklist( [ "true", "false" ] ),
	AUTH_GITHUB_ID: v.pipe( v.string(), v.minLength( 1 ) ),
	AUTH_GITHUB_SECRET: v.pipe( v.string(), v.minLength( 1 ) )
} );

v.parse( schema, process.env );

// Exportation des types pour les variables d'environnement.
export interface ProcessEnv extends v.InferOutput<typeof schema> {}