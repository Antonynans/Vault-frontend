import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#d4af37",
        "gold-light": "#f0d060",
        "bg-primary": "#080a0e",
        "bg-secondary": "#0d1017",
        "bg-card": "#111520",
        "vault-green": "#00c896",
        "vault-red": "#ff4d6d",
        "vault-blue": "#4d9fff",
      },
      fontFamily: {
        display: ["DM Serif Display", "serif"],
        sans: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
