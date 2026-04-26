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
];

export default eslintConfig;
