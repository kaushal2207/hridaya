import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#080D1B", 900: "#0D1425", 800: "#141E36", 700: "#1D2A4A" },
        electric: "#4169FF",
        cyan: "#00D4FF",
        violet: "#8B5CF6",
        mist: "#F4F6FB",
      },
      fontFamily: {
        display: ["Unbounded", "Segoe UI", "system-ui", "sans-serif"],
        sans: ["'Hanken Grotesk'", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: { content: "72rem" },
      opacity: { 12: "0.12", 98: "0.98" },
      keyframes: {
        pulseline: { "0%": { strokeDashoffset: "1000" }, "100%": { strokeDashoffset: "0" } },
        drift: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-14px,0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        pulseline: "pulseline 3.2s ease-out forwards",
        drift: "drift 8s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
