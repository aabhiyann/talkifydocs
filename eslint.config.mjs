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
