import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        highlight: "var(--highlight)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        backdrop: "var(--backdrop)",
        "bg-600": "var(--bg-600)",
        "bg-700": "var(--bg-700)",
        "bg-800": "var(--bg-800)",
        "bg-900": "var(--bg-900)",
        "bg-full": "var(--bg-full)",
      },
      fontFamily: {
        sans: ["Exo 2", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
