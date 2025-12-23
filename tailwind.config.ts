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

        // ACCENT: Yellow (for highlights, premium badges)
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a', // Adding intermediate values to match typical scales if needed, or just keeping what's there/implied
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
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