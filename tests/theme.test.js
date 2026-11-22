import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

await import("../public/ui/theme.js");

const root = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  delete root.dataset.theme;
  delete root.dataset.themeChoice;
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

/* Three states, for a site whose visitors may go back to following the system. */

const buildAuto = () => mount('<o-theme auto><button type="button">Theme</button></o-theme>');

test("a stored value it does not know follows the system", () => {
  // Another toggle, from before the site took the system, may have stored "auto".
  localStorage.setItem("theme", "auto");
  const theme = build();
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.dataset.themeChoice, "auto");
  assert.equal(theme.choice, "auto");
});

test("with auto, a press shows the other theme, then this one, then follows the system", () => {
  const theme = buildAuto();
  const button = theme.querySelector("button");
  assert.equal(theme.choice, "auto");

  // The test browser reports a light system, so the first press must show dark.
  button.click();
  assert.equal(root.dataset.theme, "dark");
  assert.equal(localStorage.getItem("theme"), "dark");

  button.click();
  assert.equal(root.dataset.theme, "light");
  assert.equal(localStorage.getItem("theme"), "light");

  button.click();
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.dataset.themeChoice, "auto");
  assert.equal(localStorage.getItem("theme"), null);
});

test("with auto, the label says where a press will take you, auto included", async () => {
  const theme = buildAuto();
  const button = theme.querySelector("button");
  const labels = [];

  for (let press = 0; press < 3; press++) {
    labels.push(button.getAttribute("aria-label"));
    button.click();
    await settled();
  }
  assert.deepEqual(labels, [
    "Switch to dark theme",
    "Switch to light theme",
    "Follow the system theme",
  ]);
});

test("two toggles stay in step when one goes back to auto", async () => {
  mount(`
    <div>
      <o-theme auto><button type="button">One</button></o-theme>
      <o-theme auto><button type="button">Two</button></o-theme>
    </div>`);
  const [one, two] = document.querySelectorAll("o-theme button");

  one.click();
  one.click();
  await settled();
  assert.equal(two.getAttribute("aria-label"), "Follow the system theme");

  // Light to auto on a light system leaves data-theme as it was; the choice still changes.
  one.click();
  await settled();
  assert.equal(two.getAttribute("aria-label"), "Switch to dark theme");
});

test("theme-init.js sets the theme and the choice before paint, and reads auto as the system", async () => {
  const { readFileSync } = await import("node:fs");
  const init = readFileSync(new URL("../public/ui/theme-init.js", import.meta.url), "utf8");
  const run = () => new Function(init)();

  for (const [value, theme, choice] of [
    [null, "light", "auto"],
    ["auto", "light", "auto"],
    ["dark", "dark", "dark"],
    ["light", "light", "light"],
  ]) {
    localStorage.clear();
    if (value) localStorage.setItem("theme", value);
    run();
    assert.equal(root.dataset.theme, theme, `stored ${value}`);
    assert.equal(root.dataset.themeChoice, choice, `stored ${value}`);
  }
});
