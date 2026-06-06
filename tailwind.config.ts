import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#070B14",
        panel: "#0D1324",
        border: "#1F2A44",
        accent: "#7C3AED",
      },
    },
  },
  plugins: [],
};

export default config;
