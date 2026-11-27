/*
 * <o-copy>: a copy button for a block of code.
 *
 *   <o-copy>
 *     <pre><code>npm install</code></pre>
 *   </o-copy>
 *
 * Put a <pre> inside. This element adds a button that copies its text, and
 * says so for a moment. The button is made here, not written in the page, so
 * a page without this script has no button that does nothing.
 */

/* How long the button says "Copied" before it goes back, in milliseconds. */
const SAID_FOR = 2000;

export class Copy extends HTMLElement {
  /** @type {HTMLButtonElement | undefined} */
  #button;

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #timer;

  connectedCallback() {
    if (this.#button) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.dataset.variant = "outline";
    button.dataset.size = "small";
    button.textContent = "Copy";
    // A screen reader hears the label change, not only sees it.
    button.setAttribute("aria-live", "polite");
    button.addEventListener("click", () => this.copy());

    this.#button = button;
    this.append(button);
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
  }

  /** The text a press will copy. */
  get text() {
    return this.querySelector("pre")?.textContent.trim() ?? "";
  }

  /** Copy the text, and say whether it worked. */
  async copy() {
    let said = "Copied";
    try {
      await navigator.clipboard.writeText(this.text);
    } catch {
      // No permission, or not a secure page. The text can still be selected.
      said = "Not copied";
    }

    this.#button.textContent = said;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => (this.#button.textContent = "Copy"), SAID_FOR);
  }
}

if (!customElements.get("o-copy")) customElements.define("o-copy", Copy);
