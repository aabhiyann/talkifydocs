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
