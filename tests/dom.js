/*
 * A browser for the tests. Import this first, before any element under test:
 * it puts window, document, and the rest of the DOM on the global scope, and
 * the elements define themselves against it when they load.
 */

import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "https://oinam.dev/" });

/**
 * Put markup in the page and hand back its first element, connected and
 * upgraded.
 *
 * @param {string} markup
 * @returns {Element}
 */
export function mount(markup) {
  // Parse first, then connect, as a browser does with a finished page. An
  // element should find its children in place when it wakes up.
  const template = document.createElement("template");
  template.innerHTML = markup;
  document.body.replaceChildren(template.content);
  return document.body.firstElementChild;
}

/**
 * Press a key on an element.
 *
 * @param {Element} target
 * @param {string} key
 */
export function press(target, key) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}
