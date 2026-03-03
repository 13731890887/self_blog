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
        cyan: "#00d4ff",
        purple: "#bf5af2",
        "bg-primary": "#080b0f",
        "bg-secondary": "#0d1117",
        "bg-tertiary": "#111820",
        "text-primary": "#e2e8f0",
        "text-secondary": "#7fa3bf",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        body: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
