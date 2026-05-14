import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0077be",
          dark: "#005a91",
          light: "#3392cb",
        },
        secondary: {
          DEFAULT: "#00a8e8",
          dark: "#007ea7",
          light: "#33b9ed",
        },
      },
    },
  },
  plugins: [],
};
export default config;
