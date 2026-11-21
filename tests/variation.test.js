import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";

import { OPTIONS, variation } from "../public/assets/variation.js";

test("with nothing chosen, it is Base: one stylesheet, and no variation", () => {
  assert.deepEqual(variation({}), {
    fonts: [],
    tokens: {},
    head: '<link rel="stylesheet" href="/ui/ui.css" />',
    css: "",
  });
});

test("the first choice of every option is Base", () => {
  const first = Object.fromEntries(
    Object.entries(OPTIONS).map(([key, option]) => [key, Object.keys(option.choices)[0]]),
  );
  assert.equal(variation(first).css, "");
  assert.deepEqual(variation(first).fonts, []);
});

test("a font is linked, not written into the variation", () => {
  const { fonts, head, css } = variation({ text: "geist" });

  assert.deepEqual(fonts, ["geist.css"]);
  assert.match(head, /href="\/ui\/fonts\/geist\.css"/);
  assert.equal(css, "");
});

test("fonts are linked after the system, in the order of the options", () => {
  const { head } = variation({ code: "geist-mono", headings: "source-serif", text: "inter" });

  assert.deepEqual(head.split("\n"), [
    '<link rel="stylesheet" href="/ui/ui.css" />',
    '<link rel="stylesheet" href="/ui/fonts/inter.css" />',
    '<link rel="stylesheet" href="/ui/fonts/source-serif.css" />',
    '<link rel="stylesheet" href="/ui/fonts/geist-mono.css" />',
  ]);
});

test("tokens that differ become the variation's stylesheet, linked last", () => {
  const { css, head } = variation({ corners: "sharp" });

  assert.equal(css, ":root {\n  --radius-sm: 0;\n  --radius-md: 0;\n  --radius-lg: 0;\n}");
  assert.equal(head.split("\n").at(-1), '<link rel="stylesheet" href="/variation.css" />');
});

test("choices add up", () => {
  const { fonts, tokens } = variation({ text: "geist", headings: "text", colors: "paper" });

  assert.deepEqual(fonts, ["geist.css"]);
  assert.equal(tokens["--font-heading"], "var(--font-sans)");
  assert.equal(tokens["--color-ink"], "light-dark(#1b1a17, #f2efe8)");
});

test("a choice that is not on offer counts as Base", () => {
  assert.deepEqual(variation({ text: "comic-sans", nonsense: "yes" }).fonts, []);
});

test("every font on offer is a file in the system", () => {
  for (const option of Object.values(OPTIONS)) {
    for (const { font } of Object.values(option.choices)) {
      if (!font) continue;
      assert.ok(existsSync(new URL(`../public/ui/fonts/${font}`, import.meta.url)), font);
    }
  }
});

test("every color on offer has a light value and a dark one", () => {
  for (const { tokens = {} } of Object.values(OPTIONS.colors.choices)) {
    for (const [name, value] of Object.entries(tokens)) {
      assert.match(value, /^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/, name);
    }
  }
});
