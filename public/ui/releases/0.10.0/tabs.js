/*
 * <onm-tabs>: sections become tabs.
 *
 *   <onm-tabs label="Install">
 *     <section>
 *       <h3>Link it</h3>
 *       <p>...</p>
 *     </section>
 *     <section>
 *       <h3>Copy it</h3>
 *       <p>...</p>
 *     </section>
 *   </onm-tabs>
 *
 * Write one <section> per tab, each opening with a heading. This element
 * builds the row of tabs from those headings, shows one section at a time,
 * and handles the keyboard: the arrow keys move between tabs, and Home and End
 * jump to the first and the last.
 *
 * Without this script the sections simply follow one another under their
 * headings. Nothing is hidden that the script did not hide.
 *
 * Fires "change" when the selected tab changes; `selected` holds its index.
 */

/* Each set of tabs needs ids of its own, to tie its tabs to its panels. */
let sets = 0;

export class Tabs extends HTMLElement {
  /** @type {HTMLButtonElement[]} */
  #tabs = [];

  /** @type {HTMLElement[]} */
  #panels = [];

  /** The index of the tab on show. */
  selected = 0;

  connectedCallback() {
    // Moving the element in the page reconnects it. Build only once.
    if (this.#tabs.length > 0) return;

    this.#panels = [...this.children].filter((child) => child.localName === "section");
    if (this.#panels.length === 0) return;

    const id = `onm-tabs-${++sets}`;
    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    if (this.hasAttribute("label")) list.setAttribute("aria-label", this.getAttribute("label"));

    this.#tabs = this.#panels.map((panel, at) => {
      const heading = panel.firstElementChild;
      const titled = heading && /^h[1-6]$/.test(heading.localName);

      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${id}-tab-${at}`;
      tab.textContent = titled ? heading.textContent.trim() : `Tab ${at + 1}`;
      tab.setAttribute("role", "tab");

      panel.id ||= `${id}-panel-${at}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      tab.setAttribute("aria-controls", panel.id);

      // The tab now says what the heading said.
      if (titled) heading.hidden = true;
      return tab;
    });

    list.append(...this.#tabs);
    list.addEventListener("click", (event) => {
      const at = this.#tabs.indexOf(event.target.closest('[role="tab"]'));
      if (at !== -1) this.select(at);
    });
    list.addEventListener("keydown", (event) => this.#onKey(event));

    this.prepend(list);
    this.#show(0);
  }

  /**
   * Show the tab at an index. Past either end, it wraps around.
   *
   * @param {number} index
   */
  select(index) {
    const count = this.#tabs.length;
    if (count === 0) return;

    const next = ((index % count) + count) % count;
    if (next === this.selected) return;

    this.#show(next);
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /** @param {number} index */
  #show(index) {
    this.selected = index;
    this.#tabs.forEach((tab, at) => {
      tab.setAttribute("aria-selected", String(at === index));
      // Only the selected tab is in the tab order; the arrows reach the rest.
      tab.tabIndex = at === index ? 0 : -1;
      this.#panels[at].hidden = at !== index;
    });
  }

  /** @param {KeyboardEvent} event */
  #onKey(event) {
    const moves = {
      ArrowRight: this.selected + 1,
      ArrowLeft: this.selected - 1,
      Home: 0,
      End: this.#tabs.length - 1,
    };
    if (!(event.key in moves)) return;

    event.preventDefault();
    this.select(moves[event.key]);
    this.#tabs[this.selected].focus();
  }
}

if (!customElements.get("onm-tabs")) customElements.define("onm-tabs", Tabs);
