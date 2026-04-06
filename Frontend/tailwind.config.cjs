/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#080c14",
        "bg-card": "#0e1420",
        "bg-raised": "#131a27",
        border: "rgba(255,255,255,0.07)",
        "border-glow": "rgba(251,191,36,0.35)",
        amber: "#fbbf24",
        "amber-dim": "rgba(251,191,36,0.15)",
        "amber-glow": "rgba(251,191,36,0.08)",
        teal: "#2dd4bf",
        "teal-dim": "rgba(45,212,191,0.12)",
        red: "#f87171",
        "red-dim": "rgba(248,113,113,0.12)",
        "text-primary": "#f0f4ff",
        "text-secondary": "rgba(240,244,255,0.55)",
        "text-muted": "rgba(240,244,255,0.28)"
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        body: ["DM Sans", "sans-serif"]
      },
      borderRadius: {
        base: "12px",
        sm: "7px"
      },
      boxShadow: {
        card: "0 24px 64px rgba(0,0,0,0.4)",
        amber: "0 0 60px rgba(251,191,36,0.06)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" }
        }
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fadeIn 0.4s ease both",
        "pulse-ring": "pulseRing 1.4s cubic-bezier(.36,.11,.89,.32) infinite"
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        ambient: "radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, transparent 70%)"
      }
    }
  },
  plugins: []
}