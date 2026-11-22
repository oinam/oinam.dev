/*
 * The copying on the color pages: a press copies a color in OKLCH, and a press
 * with Shift its hex. The marks become buttons only where the script runs.
 */

import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const { copy, copyable, shift } = await import("../public/assets/colors.js");

/** What the page last put on the clipboard. */
let clipboard;

beforeEach(() => {
  clipboard = undefined;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (text) => void (clipboard = text) },
  });
});

const markup = `<div>
  <span class="color-chip" data-chip="ink" data-oklch="oklch(24% 0.101 264.4deg)" data-hex="#06194e" role="img" aria-label="Ink, oklch(24% 0.101 264.4deg)"></span>
  <span class="color-value" data-oklch="oklch(97.5% 0.007 260.7deg)" data-hex="#f4f7fc"><code>oklch(97.5% 0.007 260.7deg)</code> <span class="color-hex">#f4f7fc</span></span>
</div>`;

test("each marked chip and value becomes a button, keeping its look, its name, and its text", () => {
  const root = mount(markup);
  copyable(root);
  const [chip, value] = root.querySelectorAll("button");

  assert.equal(root.querySelectorAll("button").length, 2);
  assert.equal(chip.type, "button");
  assert.equal(chip.className, "color-chip");
  assert.equal(chip.dataset.chip, "ink");
  assert.equal(chip.getAttribute("aria-label"), "Ink, oklch(24% 0.101 264.4deg)");
  assert.equal(value.querySelector("code").textContent, "oklch(97.5% 0.007 260.7deg)");
  assert.equal(value.hasAttribute("aria-label"), false, "a value is named by its own text");
});

test("doing it twice makes no second button", () => {
  const root = mount(markup);
  copyable(root);
  copyable(root);
  assert.equal(root.querySelectorAll("button").length, 2);
});

test("a press copies OKLCH, and with Shift the hex", async () => {
  const root = mount(markup);
  copyable(root);
  const chip = root.querySelector("button");

  assert.equal(await copy(chip, false), "oklch(24% 0.101 264.4deg)");
  assert.equal(clipboard, "oklch(24% 0.101 264.4deg)");
  assert.equal(await copy(chip, true), "#06194e");
  assert.equal(clipboard, "#06194e");
});

test("a click on the page copies through the button under it", async () => {
  const root = mount(markup);
  copyable(root);
  root
    .querySelector("button.color-value code")
    .dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(clipboard, "#f4f7fc");
});

test("a pressed button says it is copied, in place, then goes back; a status line says what", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const root = mount(markup);
  copyable(root);
  const value = root.querySelector("button.color-value");

  await copy(value, false);
  assert.ok("copied" in value.dataset);
  assert.equal(
    document.querySelector(".color-said").textContent,
    "Copied oklch(97.5% 0.007 260.7deg)",
  );
  assert.equal(document.querySelector(".color-said").getAttribute("role"), "status");

  mock.timers.tick(1500);
  assert.ok(!("copied" in value.dataset));
  mock.timers.reset();
});

test("holding Shift marks the page, so the hints show the hex; letting go or leaving clears it", () => {
  const html = document.documentElement;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));
  assert.ok("shift" in html.dataset);
  document.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift" }));
  assert.ok(!("shift" in html.dataset));

  shift(true);
  window.dispatchEvent(new Event("blur"));
  assert.ok(!("shift" in html.dataset));
});
