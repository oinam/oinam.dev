import js from "@eslint/js";
import globals from "globals";

export default [
  // Wrangler's scratch space, written by "npm run dev".
  { ignores: [".wrangler/"] },
  js.configs.recommended,
  {
    files: ["public/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    // The theme script loads as a classic script so it can run before first paint.
    files: ["public/assets/theme.js"],
    languageOptions: { sourceType: "script" },
  },
  {
    files: ["tests/**/*.js", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
];
