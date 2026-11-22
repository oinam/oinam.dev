/*
 * Sets the theme before first paint, so a stored choice never flashes the
 * wrong one. Load it in the <head> as a plain script, not a module:
 *
 *   <script src="/ui/theme-init.js"></script>
 *
 * It is the only script that blocks rendering, which is why it is this small
 * and kept apart from theme.js.
 */
(function () {
  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch {
    // Storage is blocked: fall through to the system setting.
  }

  const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
