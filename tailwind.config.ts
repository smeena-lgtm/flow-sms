import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        midnight: "var(--midnight)",
        moonlight: "var(--moonlight)",
        "ocean-swell": "var(--ocean-swell)",
        heart: "var(--heart)",
        sunlight: "var(--sunlight)",
        roots: "var(--roots)",
        olive: "var(--olive)",

        // Dark Navy Theme
        "bg-dark": "var(--bg-dark)",
        "bg-card": "var(--bg-card)",
        "bg-card-hover": "var(--bg-card-hover)",
        "bg-hover": "var(--bg-hover)",
        "bg-surface": "var(--bg-surface)",

        // Text Colors
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",

        // Border
        "border-color": "var(--border-color)",
        "border-light": "var(--border-light)",

        // Accent Colors
        "accent-blue": "var(--accent-blue)",
        "accent-purple": "var(--accent-purple)",
        "accent-pink": "var(--accent-pink)",
        "accent-green": "var(--accent-green)",
        "accent-yellow": "var(--accent-yellow)",
        "accent-red": "var(--accent-red)",
        "accent-cyan": "var(--accent-cyan)",

        // Chart Colors
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "pulse-slow": "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
export default config
