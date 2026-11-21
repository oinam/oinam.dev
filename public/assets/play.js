/*
 * oinam.dev/play/
 *
 * A few choices, and the whole page follows: this page is built from the
 * components, so changing a token changes everything on it at once. What the
 * choices come to is printed below as a variation to take away.
 *
 * Fonts are switched on the way a project would switch them on, by linking
 * their stylesheets from /ui/fonts/. Tokens are set on the root element.
 */

import { OPTIONS, variation } from "./variation.js";

const root = document.documentElement;
const panel = document.querySelector("[data-play]");
const head = document.querySelector("[data-play-head]");
const css = document.querySelector("[data-play-css]");

/** Font stylesheets linked so far, by file name. @type {Map<string, HTMLLinkElement>} */
const linked = new Map();

/** The tokens the last set of choices put on the root, to take off again. @type {string[]} */
let tokens = [];

/** One labelled <select> per option, then a way back to Base. */
function build() {
  const fields = Object.entries(OPTIONS).map(([key, option]) => {
    const label = document.createElement("label");
    label.htmlFor = `play-${key}`;
    label.textContent = option.label;

    const select = document.createElement("select");
    select.className = "input";
    select.id = label.htmlFor;
    select.name = key;
    select.append(
      ...Object.entries(option.choices).map(([value, choice]) => new Option(choice.label, value)),
    );

    const field = document.createElement("o-field");
    field.append(label, select);
    return field;
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "button";
  reset.dataset.variant = "outline";
  reset.textContent = "Back to Base";
  reset.addEventListener("click", () => {
    for (const select of panel.querySelectorAll("select")) select.selectedIndex = 0;
    apply();
  });

  const stack = document.createElement("o-stack");
  stack.append(...fields, reset);
  panel.replaceChildren(stack);
}

/** Make the page match the choices, and print what they come to. */
function apply() {
  const selects = [...panel.querySelectorAll("select")];
  const made = variation(Object.fromEntries(selects.map((select) => [select.name, select.value])));

  for (const font of made.fonts) {
    if (linked.has(font)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/ui/fonts/${font}`;
    document.head.append(link);
    linked.set(font, link);
  }
  // A font no longer chosen is switched off, not removed, so choosing it again is instant.
  for (const [font, link] of linked) link.disabled = !made.fonts.includes(font);

  for (const name of tokens) root.style.removeProperty(name);
  tokens = Object.keys(made.tokens);
  for (const name of tokens) root.style.setProperty(name, made.tokens[name]);

  head.textContent = made.head;
  css.textContent = made.css;
  css.closest("[data-play-variation]").hidden = made.css === "";
}

build();
panel.addEventListener("change", apply);
apply();
