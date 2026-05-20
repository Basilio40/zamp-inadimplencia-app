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
        zamp: {
          bg: "#0e0f11",
          bg2: "#141619",
          bg3: "#1a1d21",
          border: "rgba(255,255,255,0.08)",
          border2: "rgba(255,255,255,0.14)",
          text: "#e8eaed",
          text2: "#9aa0a8",
          text3: "#5f6368",
          red: "#e24b4a",
          "red-bg": "rgba(226,75,74,0.12)",
          "red-border": "rgba(226,75,74,0.3)",
          green: "#34a853",
          "green-bg": "rgba(52,168,83,0.12)",
          amber: "#f9ab00",
          "amber-bg": "rgba(249,171,0,0.12)",
          blue: "#4285f4",
          "blue-bg": "rgba(66,133,244,0.12)",
          "blue-border": "rgba(66,133,244,0.3)",
          purple: "#9c6fd6",
          "green-border": "rgba(52,168,83,0.3)",
          "purple-bg": "rgba(156,111,214,0.12)",
          accent: "#ff5722",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "Consolas", "Courier New", "monospace"],
        sans: ["IBM Plex Sans", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
