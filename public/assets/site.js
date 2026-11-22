/*
 * oinam.dev
 *
 * The behavior that is the site's own: the search palette, and the share
 * sheet on the home page. Both are enhancements. The pages read the same
 * without this file.
 */

import { rank } from "./search.js";

/* Search palette */

const MAX_RESULTS = 8;
const SEARCH_ICON =
  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>';

/** @type {HTMLDialogElement | undefined} Built on first use. */
let palette;

/** @type {Promise<import("./search.js").Entry[]> | undefined} Fetched on first use. */
let index;

/** The position of the highlighted result. */
let active = 0;

function loadIndex() {
  index ??= fetch("/search.json")
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => []);
  return index;
}

function buildPalette() {
  const dialog = document.createElement("dialog");
  dialog.className = "palette";
  dialog.setAttribute("aria-label", "Search");
  dialog.innerHTML = `
    <label class="palette-field">
      ${SEARCH_ICON}
      <input
        type="search"
        role="combobox"
        placeholder="Search oinam.dev"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search oinam.dev"
        aria-expanded="true"
        aria-controls="palette-results"
      />
      <kbd>Esc</kbd>
    </label>
    <ul id="palette-results" role="listbox" aria-label="Results"></ul>
  `;

  const input = dialog.querySelector("input");
  input.addEventListener("input", () => {
    active = 0;
    renderResults();
  });
  input.addEventListener("keydown", onPaletteKey);

  // A click on the backdrop lands on the dialog itself, not on its contents.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.body.append(dialog);
  return dialog;
}

async function renderResults() {
  const input = palette.querySelector("input");
  const list = palette.querySelector("ul");
  const results = rank(await loadIndex(), input.value).slice(0, MAX_RESULTS);
  active = Math.min(active, Math.max(results.length - 1, 0));

  if (results.length === 0) {
    const empty = document.createElement("li");
    empty.className = "palette-empty";
    empty.textContent = "Nothing matches that yet.";
    list.replaceChildren(empty);
    input.removeAttribute("aria-activedescendant");
    return;
  }

  list.replaceChildren(
    ...results.map((entry, position) => {
      const title = document.createElement("span");
      title.className = "palette-title";
      title.textContent = entry.title;

      const text = document.createElement("span");
      text.className = "palette-text";
      text.textContent = entry.text;

      const link = document.createElement("a");
      link.className = "palette-link";
      link.href = entry.url;
      link.tabIndex = -1;
      link.append(title, text);

      const item = document.createElement("li");
      item.id = `palette-result-${position}`;
      item.role = "option";
      item.ariaSelected = String(position === active);
      item.addEventListener("pointermove", () => highlight(position));
      item.append(link);
      return item;
    }),
  );
  input.setAttribute("aria-activedescendant", `palette-result-${active}`);
}

/** @param {number} position */
function highlight(position) {
  const items = palette.querySelectorAll('[role="option"]');
  if (items.length === 0) return;

  // Wrap around at either end.
  active = (position + items.length) % items.length;
  items.forEach((item, at) => (item.ariaSelected = String(at === active)));
  items[active].scrollIntoView({ block: "nearest" });
  palette.querySelector("input").setAttribute("aria-activedescendant", items[active].id);
}

/** @param {KeyboardEvent} event */
function onPaletteKey(event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    highlight(active + 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    highlight(active - 1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    palette.querySelector('[aria-selected="true"] a')?.click();
  }
}

function openPalette() {
  palette ??= buildPalette();
  if (palette.open) return;

  palette.querySelector("input").value = "";
  active = 0;
  renderResults();
  palette.showModal();
}

/** @param {EventTarget | null} target */
function isTypingInto(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

document.querySelector("[data-search-open]")?.addEventListener("click", openPalette);

document.addEventListener("keydown", (event) => {
  const command = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;

  if (command && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (palette?.open) palette.close();
    else openPalette();
  } else if (event.key === "/" && !command && !event.altKey && !isTypingInto(event.target)) {
    event.preventDefault();
    openPalette();
  }
});

// The markup says Command; say Control where there is no such key.
const platform = navigator.userAgentData?.platform ?? navigator.platform;
if (!/mac|iphone|ipad/i.test(platform)) {
  document.querySelectorAll("[data-command-key]").forEach((key) => (key.textContent = "Ctrl K"));
}

/* Share sheet */

// The links beside it cover the usual places. Where the device has a share
// sheet of its own (most phones), offer it too, for everywhere else: Mastodon,
// a messenger, a note.
const shareItem = document.querySelector("[data-share]");
if (shareItem && navigator.share) {
  shareItem.hidden = false;
  shareItem.querySelector("button")?.addEventListener("click", () => {
    const text = shareItem.closest(".share")?.querySelector("pre")?.textContent ?? "";
    // Closing the sheet without choosing rejects the promise; that is not an error.
    navigator.share({ title: document.title, text }).catch(() => {});
  });
}
