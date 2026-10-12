import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/content/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        navy: { DEFAULT: "#10283F", secondary: "#203D52" },
        soft: "#F8F9F7",
        warmgray: "#EEF1F0",
        jade: { DEFAULT: "#4D8E83", highlight: "#B8E4D5" },
        gold: "#C5A46A",
        charcoal: "#1C2832",
        border: "#DCE2E0",
        background: "#F8F9F7",
        foreground: "#1C2832",
        muted: { DEFAULT: "#EEF1F0", foreground: "#5A6B72" },
        primary: { DEFAULT: "#10283F", foreground: "#F8F9F7" },
        accent: { DEFAULT: "#4D8E83", foreground: "#F8F9F7" },
        destructive: { DEFAULT: "#B23A3A", foreground: "#F8F9F7" },
        ring: "#4D8E83",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        bn: ["var(--font-bn)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,40,63,0.04), 0 4px 16px rgba(16,40,63,0.06)",
        elevated: "0 8px 30px rgba(16,40,63,0.10)",
        soft: "0 6px 22px rgba(16,40,63,0.08)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "float-in": { from: { opacity: "0", transform: "translateY(12px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.86" } },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "float-in": "float-in 0.5s cubic-bezier(.22,1,.36,1)",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
