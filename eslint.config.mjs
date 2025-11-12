import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/ui/**",
    "hooks/use-mobile.ts",
    "components/bits/**",
  ]),
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      // prettier 권장 설정 (format 미스매치 시 에러 발생)
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          singleQuote: false,
          semi: true,
          trailingComma: "all",
          printWidth: 100,
          tabWidth: 2,
        },
      ],
      "react-hooks/exhaustive-deps": "off",
    },
  },
  prettierConfig,
]);

export default eslintConfig;
