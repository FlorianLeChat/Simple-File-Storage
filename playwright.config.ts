import { join } from "path";
import { devices,
	defineConfig,
	type PlaywrightTestConfig } from "@playwright/test";

const port = process.env.PORT ?? 3000;
const baseURL = `http://localhost:${ port }`;

export default defineConfig( {
	use: {
		trace: process.env.CI ? "off" : "on-first-retry",
		video: process.env.CI ? "off" : "on-first-retry",
		locale: "en-GB",
		baseURL
	},
	expect: { timeout: 10000 },
	workers: 1,
	retries: process.env.CI ? 2 : 0,
	testDir: join( __dirname, "tests/e2e" ),
	reporter: process.env.CI ? "github" : "html",
	outputDir: "test-results/",
	webServer: {
		port,
		command: "next start",
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices[ "Desktop Chrome" ] }
		},
		{
			name: "Mobile Chrome",
			use: { ...devices[ "Pixel 5" ] }
		}
	]
} as PlaywrightTestConfig );