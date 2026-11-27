/*
 * <onm-theme>: a light and dark toggle.
 *
 *   <onm-theme>
 *     <button type="button" aria-label="Switch theme">...</button>
 *   </onm-theme>
 *
 *   <onm-theme auto>...</onm-theme>     light, dark, and back to the system
 *
 * Put a <button> inside; this element makes it work. A press flips the theme
 * and remembers the choice. Until the visitor has chosen, the theme follows
 * the system, and keeps following it as it changes.
 *
 * With auto, a press goes on from the theme on show to the other one, then
 * back, then to following the system again, which forgets the choice. That
 * last press may change nothing on screen; the label says what it does.
 *
 * The theme lives in data-theme on <html>, where tokens.css reads it, and the
 * choice in data-theme-choice: "light", "dark", or "auto". Style the button's
 * icons from those: [data-theme-choice="auto"] .icon-system { ... }.
 */

const KEY = "theme";

/**
 * The theme the visitor chose, if they ever did. Anything stored but "light"
 * or "dark", such as the "auto" another toggle may have written, means the
 * system's.
 * @returns {"light" | "dark" | null}
 */
function stored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Remember a choice, or forget it with null. */
function store(theme) {
  try {
    if (theme) localStorage.setItem(KEY, theme);
    else localStorage.removeItem(KEY);
  } catch {
    // Storage is blocked: the choice lasts for this page only.
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
    this.#watcher.observe(root, { attributeFilter: ["data-theme", "data-theme-choice"] });

    // theme-init.js may have set the theme already; if not, work it out now.
    root.dataset.theme ??= stored() ?? this.#systemTheme();
    root.dataset.themeChoice = stored() ?? "auto";
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

  /** What the visitor chose: "light", "dark", or "auto" for the system's. */
  get choice() {
    const choice = document.documentElement.dataset.themeChoice;
    return choice === "light" || choice === "dark" ? choice : "auto";
  }

  /** Where a press goes from here: "light", "dark", or "auto". */
  get next() {
    // A choice that matches the system goes back to following it, so the cycle runs: the system's,
    // the other theme, the system's own theme chosen, and the system's again. Any other press
    // flips what is on show, so the first press always changes something.
    if (this.hasAttribute("auto") && this.choice !== "auto" && this.theme === this.#systemTheme())
      return "auto";
    return this.theme === "dark" ? "light" : "dark";
  }

  /** Go to the next theme, and remember the choice. */
  toggle() {
    const root = document.documentElement;
    const next = this.next;

    if (next === "auto") {
      store(null);
      root.dataset.theme = this.#systemTheme();
    } else {
      store(next);
      root.dataset.theme = next;
    }
    root.dataset.themeChoice = next;
  }

  /** @param {Event} event */
  handleEvent(event) {
    if (event.type === "click") {
      if (event.target.closest("button")) this.toggle();
    } else if (this.choice === "auto") {
      document.documentElement.dataset.theme = this.#systemTheme();
    }
  }

  #systemTheme() {
    return this.#system.matches ? "dark" : "light";
  }

  /** The label says where a press will take you. */
  #label() {
    const labels = {
      light: "Switch to light theme",
      dark: "Switch to dark theme",
      auto: "Follow the system theme",
    };
    this.querySelector("button")?.setAttribute("aria-label", labels[this.next]);
  }
}

if (!customElements.get("onm-theme")) customElements.define("onm-theme", Theme);
