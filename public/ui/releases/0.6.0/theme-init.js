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

  // Anything stored but "light" or "dark", such as "auto", means the system's.
  const chosen = stored === "light" || stored === "dark" ? stored : null;
  const dark = chosen ? chosen === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themeChoice = chosen ?? "auto";
})();
