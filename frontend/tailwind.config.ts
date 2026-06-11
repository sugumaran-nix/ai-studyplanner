import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // StudyMind Design System
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",   // Primary indigo
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        accent: {
          cyan:   "#06b6d4",
          violet: "#8b5cf6",
          amber:  "#f59e0b",
          rose:   "#f43f5e",
          emerald:"#10b981",
        },
        surface: {
          DEFAULT: "#ffffff",
          raised:  "#f8fafc",
          overlay: "#f1f5f9",
          border:  "#e2e8f0",
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
        sans: ["Inter var", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-up":    "fadeUp 0.4s ease forwards",
        "fade-in":    "fadeIn 0.3s ease forwards",
        "slide-in":   "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        card:    "0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)",
        glow:    "0 0 24px rgba(99,102,241,.25)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        "gradient-subtle": "linear-gradient(180deg, rgba(99,102,241,.08) 0%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
