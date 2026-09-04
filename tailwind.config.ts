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
        background: "#F7F3E8",
        brand: {
          50: "#f4f6ef",
          100: "#e5ebdb",
          200: "#cbd7ba",
          300: "#abbd93",
          400: "#8ca271",
          500: "#53683A", // primary olive
          600: "#44552f",
          700: "#364326",
          800: "#27351E", // dark
          900: "#1a2314",
        },
        cream: {
          50: "#FFFDF7",
          100: "#FDFBF2",
          200: "#F7F3E8",
          300: "#EDE7D3",
          400: "#E2DAC5",
        },
        shopee: {
          DEFAULT: "#EE4D2D",
          hover: "#d73212",
          light: "#fff1ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        card: "0 4px 20px -2px rgba(39, 53, 30, 0.06), 0 2px 6px -1px rgba(39, 53, 30, 0.04)",
        "card-hover": "0 10px 25px -4px rgba(39, 53, 30, 0.12), 0 4px 10px -2px rgba(39, 53, 30, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
