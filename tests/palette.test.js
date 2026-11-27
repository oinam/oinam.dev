/*
 * The search palette, in public/assets/site.js. Following a result must put
 * the palette away. A result on the page already open, such as a section of
 * it, is only a jump down the page, and the browser does it behind the open
 * dialog, where nobody sees it happen.
 */

import { mount, press } from "./dom.js";

import assert from "node:assert/strict";
import { test } from "node:test";

const entries = [
  { title: "Without classes", url: "/docs/#classless", text: "One stylesheet." },
  { title: "Standards", url: "/docs/#standards", text: "Linted and tested." },
];

globalThis.fetch = async () => new Response(JSON.stringify(entries));

mount('<button type="button" data-search-open>Search</button>');
await import("../public/assets/site.js");

// The test stays on its page; what matters is what the palette does.
window.addEventListener("click", (event) => event.preventDefault());

/** Open the palette and wait for its results. */
async function open() {
  document.querySelector("[data-search-open]").click();
  const palette = document.querySelector("dialog.palette");
  for (let tries = 0; tries < 50 && !palette.querySelector("a"); tries++) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  assert.ok(palette.open, "the palette opens");
  assert.ok(palette.querySelector("a"), "it shows results");
  return palette;
}

test("a click on a result puts the palette away", async () => {
  const palette = await open();
  palette.querySelector("a").click();
  assert.equal(palette.open, false);
});

test("Enter on a result puts the palette away", async () => {
  const palette = await open();
  press(palette.querySelector("input"), "Enter");
  assert.equal(palette.open, false);
});
