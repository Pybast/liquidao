import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{ts,tsx}",
  ],
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
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: [
      {
        chaingate: {
          primary: "#667eea",
          "primary-focus": "#5a67d8",
          "primary-content": "#ffffff",
          secondary: "#764ba2",
          "secondary-focus": "#6b46c1",
          "secondary-content": "#ffffff",
          accent: "#38b2ac",
          "accent-focus": "#319795",
          "accent-content": "#ffffff",
          neutral: "#2d3748",
          "neutral-focus": "#1a202c",
          "neutral-content": "#a0aec0",
          "base-100": "#2d3748",
          "base-200": "#1a202c",
          "base-300": "#171923",
          "base-content": "#a0aec0",
          info: "#3182ce",
          "info-content": "#ffffff",
          success: "#38a169",
          "success-content": "#ffffff",
          warning: "#d69e2e",
          "warning-content": "#ffffff",
          error: "#e53e3e",
          "error-content": "#ffffff",
        },
      },
    ],
  },
}
export default config
