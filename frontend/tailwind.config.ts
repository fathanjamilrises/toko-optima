import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgBase: "var(--bg-base)", surface: "var(--bg-surface)", raised: "var(--bg-raised)",
        line: "var(--line)", ink: "var(--text-1)", muted: "var(--text-2)", subtle: "var(--text-3)",
        accent: "var(--accent)", accentEdge: "var(--accent-edge)", crema: "var(--crema)", profit: "var(--profit)", loss: "var(--loss)",
        revenue: "var(--revenue)", cost: "var(--cost)", warn: "var(--warn)",
      },
      borderRadius: { tactile: "20px", inset: "12px" },
      fontFamily: { display: ["var(--font-fraunces)", "Georgia", "serif"], ui: ["var(--font-figtree)", "Arial", "sans-serif"], mono: ["var(--font-mono)", "monospace"], note: ["var(--font-caveat)", "cursive"] },
    },
  },
  plugins: [],
};

export default config;
