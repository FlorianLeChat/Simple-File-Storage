/**
 * @type {import("tailwindcss").Config}
 */
module.exports = {
	darkMode: "media",
	content: [ "./app/**/*.{ts,tsx}" ],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))"
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))"
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))"
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))"
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))"
				}
			},
			keyframes: {
				github: {
					"0%, 100%": { transform: "rotate(0)" },
					"20%, 60%": { transform: "rotate(-25deg)" },
					"40%, 80%": { transform: "rotate(10deg)" }
				}
			},
			animation: {
				github: "github 560ms ease-in-out"
			}
		}
	},
	plugins: [ require( "tailwindcss-animate" ) ]
};