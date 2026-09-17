import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f8fafc",
        panel: "#ffffff",
        panelAlt: "#f1f5f9",
        line: "rgba(148, 163, 184, 0.22)",
        accent: "#10b981",
        accentSoft: "#d1fae5",
        bgDark: "#111827",
        panelDark: "#1f2937",
        lineDark: "rgba(255,255,255,0.1)",
        primary: "#10b981",
        primaryDark: "#0f766e",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(15, 118, 110, 0.08), 0 8px 20px rgba(15, 23, 42, 0.05)",
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.16) 1px, transparent 0)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
