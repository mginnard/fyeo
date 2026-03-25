import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic: danger only for destructive actions
        danger: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
        },
        // Success only for toggles / enabled state
        success: "#16a34a",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
