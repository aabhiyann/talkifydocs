import type { Config } from 'tailwindcss'
import { designSystem, componentStyles } from './src/styles/design-system.config'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...designSystem.colors,
        // PRIMARY: Professional Blue (main brand color)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main blue
          600: '#2563eb',  // Primary action color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },

        // SUCCESS/TURTLE: Green (only for success states & turtle elements)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Turtle green
          600: '#16a34a',
          700: '#15803d',
          DEFAULT: '#22c55e',
          foreground: '#ffffff',
        },

        // ACCENT: Sky Blue / Cyan (replacing Yellow)
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...designSystem.typography.fontFamily.sans],
        serif: ['var(--font-fraunces)', ...designSystem.typography.fontFamily.serif],
        mono: [...designSystem.typography.fontFamily.mono],
      },
      fontSize: designSystem.typography.fontSize as any,
      fontWeight: designSystem.typography.fontWeight,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.shadows,
      zIndex: designSystem.zIndex,
      transitionDuration: designSystem.animation.duration,
      transitionTimingFunction: designSystem.animation.easing,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config