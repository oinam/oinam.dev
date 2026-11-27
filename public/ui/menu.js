/*
 * <onm-menu>: a button and the short list of actions it opens.
 *
 * The markup is in menu.css. The browser already opens and closes the list,
 * which is a popover. This element adds what a list of actions needs on top:
 *
 * - When it opens, the first item takes the focus.
 * - The arrow keys move between items, and Home and End jump to the ends.
 * - Choosing an item closes the list.
 * - With the context attribute, a right click anywhere inside the element
 *   opens the list where the pointer is.
 */

export class Menu extends HTMLElement {
  connectedCallback() {
    this.addEventListener("keydown", this);
    this.addEventListener("click", this);
    this.addEventListener("contextmenu", this);
    // "toggle" does not bubble, so it is heard on the list itself.
    this.list?.addEventListener("toggle", this);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this);
    this.removeEventListener("click", this);
    this.removeEventListener("contextmenu", this);
    this.list?.removeEventListener("toggle", this);
  }

  /** The popover that holds the items. */
  get list() {
    return this.querySelector("[popover]");
  }

  /** The items that can be chosen, in order. */
  get items() {
    return [...this.list.querySelectorAll("a[href], button:not(:disabled)")];
  }

  /** @param {Event} event */
  handleEvent(event) {
    const list = this.list;
    if (!list) return;

    if (event.type === "toggle") {
      if (event.newState === "open") this.items[0]?.focus();
      else this.#unplace();
    } else if (event.type === "click") {
      // An item was chosen: its own work is done by its own listener or link.
      if (list.contains(event.target) && event.target.closest("a, button")) list.hidePopover();
    } else if (event.type === "contextmenu") {
      if (!this.hasAttribute("context") || list.contains(event.target)) return;
      event.preventDefault();
      this.#place(event.clientX, event.clientY);
      list.showPopover();
    } else if (list.contains(event.target)) {
      this.#onKey(event);
    }
  }

  /** @param {KeyboardEvent} event */
  #onKey(event) {
    const items = this.items;
    const at = items.indexOf(document.activeElement);
    const moves = {
      ArrowDown: at + 1,
      ArrowUp: at - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (!(event.key in moves) || items.length === 0) return;

    event.preventDefault();
    // Past either end, it wraps around.
    items[(moves[event.key] + items.length) % items.length].focus();
  }

  /** Put the list at a point on the screen, in place of under its button. */
  #place(x, y) {
    const { style } = this.list;
    style.positionArea = "none";
    style.margin = "0";
    style.left = `${x}px`;
    style.top = `${y}px`;
  }

  #unplace() {
    for (const property of ["position-area", "margin", "left", "top"]) {
      this.list.style.removeProperty(property);
    }
  }
}

if (!customElements.get("onm-menu")) customElements.define("onm-menu", Menu);
