import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        accent: {
          cyan:    "#06b6d4",
          violet:  "#8b5cf6",
          amber:   "#f59e0b",
          rose:    "#f43f5e",
          emerald: "#10b981",
        },
        dark: {
          base:    "#0f0f13",
          surface: "#16161d",
          raised:  "#1e1e28",
          overlay: "#252532",
          border:  "#2e2e3e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)",
        glow: "0 0 24px rgba(99,102,241,.25)",
      },
    },
  },
  plugins: [],
};

export default config;
