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
        midnight: "#3D3D3D",
        moonlight: "#F3EDDF",
        "ocean-swell": "#7DADBB",
        heart: "#F99AA9",
        sunlight: "#E89700",
        roots: "#8C4500",
        olive: "#767317",
        "bg-dark": "#2D2D2D",
        "bg-card": "#3D3D3D",
        "bg-hover": "#4D4D4D",
        "text-primary": "#F3EDDF",
        "text-secondary": "#A0A0A0",
        "border-color": "#4D4D4D",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
