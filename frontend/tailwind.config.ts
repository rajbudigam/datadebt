import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 500: "#6EE7F2", 600: "#22D3EE" } },
      boxShadow: { glow: "0 0 60px rgba(34,211,238,0.3)" },
    },
  },
  plugins: [],
};
export default config;
