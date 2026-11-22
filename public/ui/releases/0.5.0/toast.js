/*
 * <o-toast>: brief messages that appear in a corner and go away again.
 *
 * Put one <o-toast> on the page, anywhere, or let this script add it when the
 * first message is shown. There are two ways to show a message.
 *
 * From markup, with no script of your own. Pressing the button shows it:
 *
 *   <button class="button" type="button" data-toast="Berth 12 is yours">Book</button>
 *
 * From script:
 *
 *   import { toast } from "/ui/toast.js";
 *   toast("Berth 12 is yours");
 *
 * A message stays for six seconds, or until it is dismissed. It is announced
 * to screen readers politely, without taking the focus.
 */

/* How long a message stays, in milliseconds. */
const STAYS_FOR = 6000;

export class Toast extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "region");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Notifications");
  }

  /**
   * Show a message.
   *
   * @param {string} text
   * @param {{ staysFor?: number }} [options] Zero keeps it until it is dismissed.
   * @returns {HTMLElement} The message, which can be removed early with `.remove()`.
   */
  show(text, { staysFor = STAYS_FOR } = {}) {
    const words = document.createElement("span");
    words.textContent = text;

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "button";
    dismiss.dataset.variant = "ghost";
    dismiss.dataset.size = "small";
    dismiss.textContent = "Dismiss";

    const message = document.createElement("div");
    message.setAttribute("role", "status");
    message.append(words, dismiss);

    dismiss.addEventListener("click", () => message.remove());
    if (staysFor > 0) setTimeout(() => message.remove(), staysFor);

    this.append(message);
    return message;
  }
}

if (!customElements.get("o-toast")) customElements.define("o-toast", Toast);

/**
 * Show a message, adding an <o-toast> to the page if it has none.
 *
 * @param {string} text
 * @param {{ staysFor?: number }} [options]
 * @returns {HTMLElement}
 */
export function toast(text, options) {
  let region = document.querySelector("o-toast");
  if (!region) {
    region = document.createElement("o-toast");
    document.body.append(region);
  }
  return region.show(text, options);
}

// One listener for the whole page serves every button that carries a message.
document.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-toast]");
  if (button) toast(button.dataset.toast);
});
