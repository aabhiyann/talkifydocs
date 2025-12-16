import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "3rem",
        xl: "3rem",
        "2xl": "3rem",
      },
      screens: {
        "2xl": "1280px" /* Max width per Wist design */,
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        // Neutral & brand primitives aligned with v2 design (slate + blue)
        slate: colors.slate,

        // Design System Colors
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          DEFAULT: "var(--primary-500)",
          foreground: "var(--secondary-50)",
        },
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          DEFAULT: "var(--secondary-500)",
          foreground: "var(--secondary-50)",
        },
        accent: {
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
          DEFAULT: "var(--accent-500)",
          foreground: "var(--secondary-50)",
        },
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
          700: "var(--gray-700)",
          800: "var(--gray-800)",
          900: "var(--gray-900)",
        },
        success: {
          50: "var(--success-50)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
        },
        warning: {
          50: "var(--warning-50)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
        },
        error: {
          50: "var(--error-50)",
          500: "var(--error-500)",
          600: "var(--error-600)",
          700: "var(--error-700)",
        },
        info: {
          50: "var(--info-50)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
        },
        danger: {
          50: "var(--danger-50)",
          500: "var(--danger-500)",
          600: "var(--danger-600)",
          700: "var(--danger-700)",
        },
        // Legacy shadcn colors for compatibility
        border: "var(--secondary-200)",
        input: "var(--secondary-200)",
        ring: "var(--primary-500)",
        background: "var(--secondary-50)",
        foreground: "var(--secondary-900)",
        destructive: {
          DEFAULT: "var(--error-500)",
          foreground: "var(--secondary-50)",
        },
        muted: {
          DEFAULT: "var(--secondary-100)",
          foreground: "var(--secondary-600)",
        },
        popover: {
          DEFAULT: "var(--secondary-50)",
          foreground: "var(--secondary-900)",
        },
        card: {
          DEFAULT: "var(--secondary-50)",
          foreground: "var(--secondary-900)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-in",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
