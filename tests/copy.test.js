import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

await import("../public/ui/copy.js");

/** What the page last put on the clipboard. */
let clipboard;

beforeEach(() => {
  clipboard = undefined;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (text) => void (clipboard = text) },
  });
});

const build = () => mount("<onm-copy><pre><code>\n  npm install\n</code></pre></onm-copy>");

test("it adds one button, which the page did not have to write", () => {
  const copy = build();
  const buttons = copy.querySelectorAll("button");

  assert.equal(buttons.length, 1);
  assert.equal(buttons[0].textContent, "Copy");
  assert.equal(buttons[0].type, "button");
});

test("a press copies the code, without the space around it", async () => {
  const copy = build();

  await copy.copy();

  assert.equal(clipboard, "npm install");
});

test("the button says so, then goes back", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const copy = build();
  const button = copy.querySelector("button");

  await copy.copy();
  assert.equal(button.textContent, "Copied");

  mock.timers.tick(2000);
  assert.equal(button.textContent, "Copy");
  mock.timers.reset();
});

test("when the clipboard refuses, the button says that instead", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async () => Promise.reject(new Error("denied")) },
  });
  const copy = build();

  await copy.copy();

  assert.equal(copy.querySelector("button").textContent, "Not copied");
});

test("moving the element does not add a second button", () => {
  const copy = build();

  document.body.append(copy);

  assert.equal(copy.querySelectorAll("button").length, 1);
});
