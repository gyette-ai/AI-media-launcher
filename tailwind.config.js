/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                popover: "hsl(var(--popover))",
                "popover-foreground": "hsl(var(--popover-foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                "ai-bg": "#0a0a0f",
                "ai-card": "rgba(20, 20, 30, 0.6)",
                "ai-border": "rgba(255, 255, 255, 0.1)",
                "ai-accent": "#00f0ff",
            },
            animation: {
                "glow": "glow 2s ease-in-out infinite alternate",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(0, 240, 255, 0.2)" },
                    "100%": { boxShadow: "0 0 20px rgba(0, 240, 255, 0.6), 0 0 10px rgba(0, 240, 255, 0.4)" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                }
            }
        },
    },
    plugins: [],
}
