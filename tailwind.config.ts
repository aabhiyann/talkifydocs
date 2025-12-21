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
      colors: designSystem.colors,
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