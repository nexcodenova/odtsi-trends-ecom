import type { Config } from "tailwindcss";
import { odtsiTheme } from "../../packages/config/tailwind-theme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/index.ts",
    "../../packages/ui/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: odtsiTheme,
  },
  plugins: [],
};

export default config;
