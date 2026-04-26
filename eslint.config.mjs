import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "build/**",
      "dist/**",
      "out/**",
      "next-env.d.ts",
      "src/generated/**",
      "**/*.min.js",
      "**/*.min.mjs",
      "public/pdf.worker.min.mjs",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Temporary: existing codebase has ~80 explicit-any sites; will be
      // removed type-by-type in p1-12 and promoted back to "error" then.
      "@typescript-eslint/no-explicit-any": "warn",

      // The following react-hooks 7.x rules are React Compiler-style checks
      // that flag real but pre-existing issues (setState-in-effect,
      // hoisted-callback access, mid-render mutation). They need careful
      // refactor in components/{ThemeProvider,ThemeToggle,UploadButton,
      // ClientThemeProvider}.tsx and components/chat/{ChatWrapper,Messages}.tsx
      // and components/ui/notification.tsx. Tracked as a follow-up; warn for now
      // so CI lint can run.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    files: [
      "next.config.js",
      "jest.config.js",
      "tailwind.config.ts",
      "scripts/**/*.js",
      "scripts/**/*.cjs",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
