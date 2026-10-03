import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "react"],
  categories: {
    correctness: "error",
  },
  // React Compiler 系のルールは eslint-plugin-react-hooks を JS プラグインとして読み込む
  jsPlugins: [{ name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" }],
  options: {
    // 型情報を使うルール(oxlint-tsgolint)
    typeAware: true,
  },
  env: {
    browser: true,
    es2020: true,
  },
  rules: {
    "typescript/no-explicit-any": "error",
    "typescript/ban-ts-comment": "error",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "react/only-export-components": ["error", { allowConstantExport: true }],
    "react-hooks-js/static-components": "error",
    "react-hooks-js/use-memo": "error",
    "react-hooks-js/void-use-memo": "error",
    "react-hooks-js/preserve-manual-memoization": "error",
    "react-hooks-js/incompatible-library": "error",
    "react-hooks-js/immutability": "error",
    "react-hooks-js/globals": "error",
    "react-hooks-js/refs": "error",
    "react-hooks-js/set-state-in-effect": "error",
    "react-hooks-js/error-boundaries": "error",
    "react-hooks-js/purity": "error",
    "react-hooks-js/set-state-in-render": "error",
    "react-hooks-js/unsupported-syntax": "error",
    "react-hooks-js/config": "error",
    "react-hooks-js/gating": "error",
  },
  ignorePatterns: ["dist"],
});
