import js from "@eslint/js";
import globals from "globals";

export default [
  // Wrangler's scratch space, written by "npm run dev".
  { ignores: [".wrangler/", "evals/runs/"] },
  js.configs.recommended,
  {
    files: ["public/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    // A plain script, not a module, so it can run before first paint.
    files: ["public/ui/theme-init.js"],
    languageOptions: { sourceType: "script" },
  },
  {
    // Tools that a project runs with Node, not that a browser loads.
    files: ["public/ui/tools/**/*.js", "evals/**/*.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    // The tests run in Node, against a DOM that tests/dom.js puts on the global scope.
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
