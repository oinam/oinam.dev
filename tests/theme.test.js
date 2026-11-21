import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

await import("../public/ui/theme.js");

const root = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  delete root.dataset.theme;
});

const build = () => mount('<o-theme><button type="button">Theme</button></o-theme>');

/** Wait for the page to notice a change to the theme. */
const settled = () => new Promise((resolve) => setTimeout(resolve));

test("with nothing chosen, it follows the system", () => {
  build();
  // The test browser reports a light system.
  assert.equal(root.dataset.theme, "light");
});

test("it keeps a theme that was set before it loaded", () => {
  root.dataset.theme = "dark";

  const theme = build();

  assert.equal(theme.theme, "dark");
});

test("a press flips the theme and remembers the choice", () => {
  const theme = build();

  theme.querySelector("button").click();
  assert.equal(root.dataset.theme, "dark");
  assert.equal(localStorage.getItem("theme"), "dark");

  theme.querySelector("button").click();
  assert.equal(root.dataset.theme, "light");
  assert.equal(localStorage.getItem("theme"), "light");
});

test("the label says where a press will take you", async () => {
  const theme = build();
  const button = theme.querySelector("button");

  assert.equal(button.getAttribute("aria-label"), "Switch to dark theme");

  button.click();
  await settled();
  assert.equal(button.getAttribute("aria-label"), "Switch to light theme");
});

test("two toggles on a page stay in step", async () => {
  mount(`
    <div>
      <o-theme><button type="button">One</button></o-theme>
      <o-theme><button type="button">Two</button></o-theme>
    </div>`);
  const [one, two] = document.querySelectorAll("o-theme button");

  one.click();
  await settled();

  assert.equal(two.getAttribute("aria-label"), "Switch to light theme");
});

test("a click elsewhere inside it does nothing", () => {
  const theme = mount('<o-theme><span>Theme</span><button type="button">Go</button></o-theme>');

  theme.querySelector("span").click();

  assert.equal(root.dataset.theme, "light");
});
