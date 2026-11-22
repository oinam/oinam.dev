/*
 * <o-theme>: a light and dark toggle.
 *
 *   <o-theme>
 *     <button type="button" aria-label="Switch theme">...</button>
 *   </o-theme>
 *
 * Put a <button> inside; this element makes it work. A press flips the theme
 * and remembers the choice. Until the visitor has chosen, the theme follows
 * the system, and keeps following it as it changes.
 *
 * The theme lives in data-theme on <html>, where tokens.css reads it. Style
 * the button's icons from that: [data-theme="dark"] .icon-sun { ... }.
 */

const KEY = "theme";

/** @returns {string | null} The theme the visitor chose, if they ever did. */
function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export class Theme extends HTMLElement {
  #system = matchMedia("(prefers-color-scheme: dark)");

  // Another toggle on the page, or any other script, may change the theme.
  // Watching the attribute itself keeps every toggle's label true.
  #watcher = new MutationObserver(() => this.#label());

  connectedCallback() {
    const root = document.documentElement;

    this.addEventListener("click", this);
    this.#system.addEventListener("change", this);
    this.#watcher.observe(root, { attributeFilter: ["data-theme"] });

    // theme-init.js may have set the theme already; if not, work it out now.
    root.dataset.theme ??= stored() ?? (this.#system.matches ? "dark" : "light");
    this.#label();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this);
    this.#system.removeEventListener("change", this);
    this.#watcher.disconnect();
  }

  /** The theme on show: "light" or "dark". */
  get theme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  /** Flip the theme, and remember the choice. */
  toggle() {
    const theme = this.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Storage is blocked: the choice lasts for this page only.
    }
  }

  /** @param {Event} event */
  handleEvent(event) {
    if (event.type === "click") {
      if (event.target.closest("button")) this.toggle();
    } else if (!stored()) {
      document.documentElement.dataset.theme = this.#system.matches ? "dark" : "light";
    }
  }

  /** The label says where a press will take you. */
  #label() {
    this.querySelector("button")?.setAttribute(
      "aria-label",
      this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

if (!customElements.get("o-theme")) customElements.define("o-theme", Theme);
