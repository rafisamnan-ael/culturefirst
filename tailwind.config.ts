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
        navy: { DEFAULT: "#0A1929", secondary: "#142F4A", accent: "#1A4570" },
        soft: "#FDFDFD",
        warmgray: "#F4F6F5",
        jade: { DEFAULT: "#2D7D6D", highlight: "#E1F2EE", deep: "#1B4A40" },
        gold: { DEFAULT: "#D4AF37", light: "#E6C96B" },
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
        lux: "0 10px 40px -12px rgba(16,40,63,0.28), 0 2px 10px rgba(16,40,63,0.06)",
        "lux-strong": "0 28px 70px -28px rgba(10,25,41,0.5), 0 12px 30px -14px rgba(45,125,109,0.4)",
        glow: "0 0 0 1px rgba(77,142,131,0.25), 0 12px 40px -10px rgba(45,125,109,0.45)",
        gold: "0 10px 40px -12px rgba(212,175,55,0.50)",
        "gold-glow": "0 0 0 1px rgba(212,175,55,0.35), 0 16px 50px -16px rgba(212,175,55,0.55)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "float-in": { from: { opacity: "0", transform: "translateY(12px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.86" } },
        blob: {
          "0%,100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(36px, -44px) scale(1.12)" },
          "66%": { transform: "translate(-28px, 26px) scale(0.92)" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shine: { "100%": { transform: "translateX(100%)" } },
        "pulse-glow": {
          "0%,100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        aurora: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        bob: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        sheen: {
          "0%": { transform: "translateX(-140%) skewX(-14deg)" },
          "100%": { transform: "translateX(260%) skewX(-14deg)" },
        },
        "orb-drift": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(40px,-30px,0) scale(1.1)" },
          "66%": { transform: "translate3d(-30px,24px,0) scale(0.95)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "float-in": "float-in 0.5s cubic-bezier(.22,1,.36,1)",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        blob: "blob 20s infinite ease-in-out",
        "gradient-x": "gradient-x 7s ease infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(.22,1,.36,1) both",
        "scale-in": "scale-in 0.6s cubic-bezier(.22,1,.36,1) both",
        float: "float 6s ease-in-out infinite",
        shine: "shine 2.2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 5s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        aurora: "aurora 22s ease-in-out infinite",
        "gradient-pan": "gradient-pan 10s linear infinite",
        bob: "bob 7s ease-in-out infinite",
        "bob-slow": "bob 12s ease-in-out infinite",
        sheen: "sheen 4s ease-in-out infinite",
        "orb-drift": "orb-drift 24s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-navy": "linear-gradient(135deg, #0A1929 0%, #142F4A 55%, #1A4570 100%)",
        "gradient-jade": "linear-gradient(135deg, #2D7D6D 0%, #1B4A40 100%)",
        "gradient-premium": "linear-gradient(120deg, #0A1929 0%, #1B4A40 45%, #2D7D6D 75%, #D4AF37 130%)",
        "gradient-royal": "linear-gradient(135deg, #10283F 0%, #1A4570 50%, #2D7D6D 100%)",
        "gradient-aurora": "linear-gradient(120deg, #0A1929 0%, #1B4A40 28%, #2D7D6D 52%, #1A4570 76%, #0A1929 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(45,125,109,0.16) 0%, rgba(26,69,112,0.10) 50%, rgba(212,175,55,0.14) 100%)",
        "gradient-jade-soft": "linear-gradient(135deg, rgba(45,125,109,0.12), rgba(225,242,238,0.45))",
      },
    },
  },
  plugins: [],
};

export default config;
