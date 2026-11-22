/*
 * oinam.dev, the color pages
 *
 * Every chip and every value on them can be pressed to copy it: a press
 * copies the color in OKLCH, and a press with Shift held copies its hex, as on
 * Tailwind's colors page. The page marks each one with data-oklch and
 * data-hex, and this script makes each a button, so a page without it has no
 * button that does nothing.
 *
 * A chip shows its value as the pointer rests on it, and says "Copied" in the
 * same place once pressed; a value in a table says it in place of itself. A
 * line the eye does not see tells a screen reader what was copied.
 */

/* How long "Copied" stays, in milliseconds. */
const SAID_FOR = 1500;

/** Turn every marked chip and value under `root` into a button that copies it. */
export function copyable(root = document) {
  for (const item of root.querySelectorAll("[data-oklch]:not(button)")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.className;
    Object.assign(button.dataset, item.dataset);
    // A chip has no text of its own, so it keeps the name the page gave it.
    const label = item.getAttribute("aria-label");
    if (label) button.setAttribute("aria-label", label);
    button.append(...item.childNodes);
    item.replaceWith(button);
  }
}

/**
 * Copy a chip's or a value's color: OKLCH, or hex when `shift` is held.
 *
 * @param {HTMLElement} button
 * @param {boolean} shift
 * @returns {Promise<string>} What was copied.
 */
export async function copy(button, shift) {
  const text = shift ? button.dataset.hex : button.dataset.oklch;
  await navigator.clipboard.writeText(text);
  button.dataset.copied = "";
  clearTimeout(timers.get(button));
  timers.set(
    button,
    setTimeout(() => delete button.dataset.copied, SAID_FOR),
  );
  say(`Copied ${text}`);
  return text;
}

/** @type {WeakMap<HTMLElement, ReturnType<typeof setTimeout>>} */
const timers = new WeakMap();

/* Tell a screen reader, in a line made the first time it is needed. */
function say(text) {
  let line = document.querySelector(".color-said");
  if (!line) {
    line = document.createElement("p");
    line.className = "color-said";
    line.setAttribute("role", "status");
    document.body.append(line);
  }
  line.textContent = text;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("button[data-oklch]");
  if (button) copy(button, event.shiftKey).catch(() => say("Could not copy"));
});

copyable();
