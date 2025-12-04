import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0F172A",
        "card-dark": "#1E293B",
        "accent-purple": "#8B5CF6",
        "accent-cyan": "#06B6D4"
      }
    }
  },
  plugins: []
};

export default config;
