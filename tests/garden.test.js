/*
 * The gate for the garden. A design is one stylesheet of token values, and
 * anyone, or any agent, may send one. These tests are what makes that safe:
 * a design that passes cannot change markup, cannot restyle a component,
 * cannot name a token that is not there, and cannot make text hard to read.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { contrast, mix, rgb } from "../scripts/color.js";

const GARDEN = new URL("../public/garden/", import.meta.url);
const read = (name) => readFileSync(new URL(name, GARDEN), "utf8");

const { variations } = JSON.parse(read("variations.json"));
// The formatter wraps long lines, so compare the page with its white space evened out.
const page = read("index.html").replace(/\s+/g, " ");
const base = readFileSync(new URL("../ui/tokens.css", GARDEN), "utf8");
const fonts = readdirSync(new URL("../ui/fonts/", GARDEN));

const designs = variations.filter((variation) => variation.file);

/** Every `--name: value` in a stylesheet, comments aside. */
function declarations(css) {
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return Object.fromEntries(
    [...code.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}

/** A color token's two values, light then dark. */
const pair = (value) => value.match(/#[0-9a-f]{3,6}/g).map(rgb);

test("the measure agrees with the browser about Base", () => {
  const tokens = declarations(base);
  const [ink, cloud] = [pair(tokens["--color-ink"])[0], pair(tokens["--color-cloud"])[0]];

  // Chrome reports 4.99 for the faint ink on cloud, and 6.98 for the soft.
  assert.equal(contrast(mix(ink, cloud, 0.58), cloud).toFixed(1), "5.0");
  assert.equal(contrast(mix(ink, cloud, 0.68), cloud).toFixed(1), "7.0");
});

test("every design file is listed, and every design listed has its file", () => {
  const files = readdirSync(GARDEN).filter((name) => name.endsWith(".css"));
  assert.deepEqual(files.toSorted(), designs.map((design) => design.file).toSorted());
});

test("the list starts with Base, which is no file at all", () => {
  assert.deepEqual(
    { name: variations[0].name, file: variations[0].file, fonts: variations[0].fonts },
    { name: "base", file: null, fonts: [] },
  );
});

test("names are plain, and no two designs share one", () => {
  const names = variations.map((variation) => variation.name);

  assert.equal(new Set(names).size, names.length);
  for (const name of names) assert.match(name, /^[a-z][a-z0-9-]*$/);
});

test("every design is on the page, described as the list describes it", () => {
  for (const { name, title, by, description, file, fonts } of variations) {
    const link = new RegExp(
      `data-design="${name}"\\s+data-file="${file ?? ""}"\\s+data-fonts="${fonts.join(" ")}"\\s*>\\s*${title}\\s*<`,
    );
    assert.match(page, link, `${name} is not linked on the page as listed`);
    assert.ok(page.includes(by), `${name}: the page does not name ${by}`);
    assert.ok(page.includes(description), `${name}: the page does not describe it`);
  }
});

for (const design of designs) {
  const css = read(design.file);
  const tokens = declarations(css);
  const known = declarations(base);

  test(`${design.name}: says what it is and whose it is`, () => {
    const opening = `/*\n * ${design.title}\n * By ${design.by}\n *\n * ${design.description}\n`;
    assert.ok(css.startsWith(opening), "the opening comment does not match variations.json");
  });

  test(`${design.name}: is one :root rule that sets tokens, and nothing else`, () => {
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const [, body] = code.match(/^:root\s*\{([\s\S]*)\}$/) ?? [];

    assert.ok(body !== undefined, "it must be a single :root rule");
    assert.doesNotMatch(body, /[{}@]/, "no nested rules, and no at-rules");
    for (const line of body
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)) {
      assert.match(line, /^--[a-z0-9-]+:/, `"${line}" is not a token`);
    }
    assert.doesNotMatch(code, /url\(|https?:|!important/);
  });

  test(`${design.name}: sets only tokens that Base has`, () => {
    assert.ok(Object.keys(tokens).length > 0, "it changes nothing");
    for (const name of Object.keys(tokens)) assert.ok(name in known, `${name} is not a token`);
  });

  test(`${design.name}: gives every color a light value and a dark one`, () => {
    for (const [name, value] of Object.entries(tokens)) {
      if (!name.startsWith("--color-")) continue;
      assert.match(value, /^light-dark\(#(?:[0-9a-f]{3}){1,2}, #(?:[0-9a-f]{3}){1,2}\)$/, name);
    }
  });

  test(`${design.name}: asks only for fonts the system carries, and names them`, () => {
    for (const font of design.fonts) assert.ok(fonts.includes(font), `${font} is not in ui/fonts/`);
    const named = design.fonts.length > 0 ? ` * Fonts: ${design.fonts.join(", ")}\n` : "";
    assert.ok(css.includes(named), "the comment's Fonts line does not match variations.json");
  });

  test(`${design.name}: a status color it changes still reads on its fill`, () => {
    for (const status of ["success", "warning", "danger", "info"]) {
      const [text, fill] = [`--color-${status}`, `--color-${status}-fill`];
      if (!(text in tokens) && !(fill in tokens)) continue;
      const [texts, fills] = [text, fill].map((name) => pair(tokens[name] ?? known[name]));
      for (const [at, theme] of ["light", "dark"].entries()) {
        const ratio = contrast(texts[at], fills[at]);
        assert.ok(ratio >= 4.5, `${status}, ${theme}: ${ratio.toFixed(2)} to 1`);
      }
    }
  });

  test(`${design.name}: a kind color it changes still reads on its fill`, () => {
    for (let n = 1; n <= 6; n++) {
      const [text, fill] = [`--color-hue-${n}`, `--color-hue-${n}-fill`];
      if (!(text in tokens) && !(fill in tokens)) continue;
      const [texts, fills] = [text, fill].map((name) => pair(tokens[name] ?? known[name]));
      for (const [at, theme] of ["light", "dark"].entries()) {
        const ratio = contrast(texts[at], fills[at]);
        assert.ok(ratio >= 4.5, `hue ${n}, ${theme}: ${ratio.toFixed(2)} to 1`);
      }
    }
  });

  test(`${design.name}: the accent stands out from its page, and its label reads on it`, () => {
    const color = (name) => pair(tokens[name] ?? known[name]);
    const [accents, labels, clouds, milks] = [
      "--color-accent",
      "--color-accent-text",
      "--color-cloud",
      "--color-milk",
    ].map(color);
    for (const [at, theme] of ["light", "dark"].entries()) {
      for (const ground of [clouds[at], milks[at]]) {
        const edge = contrast(accents[at], ground);
        assert.ok(edge >= 3, `accent on the page, ${theme}: ${edge.toFixed(2)} to 1`);
      }
      const ratio = contrast(labels[at], accents[at]);
      assert.ok(ratio >= 4.5, `accent label, ${theme}: ${ratio.toFixed(2)} to 1`);
    }
  });

  test(`${design.name}: keeps text readable, in light and in dark`, () => {
    const color = (name) => pair(tokens[name] ?? known[name]);
    const [inks, clouds, milks] = ["--color-ink", "--color-cloud", "--color-milk"].map(color);

    for (const [at, theme] of ["light", "dark"].entries()) {
      const [ink, cloud, milk] = [inks[at], clouds[at], milks[at]];
      // The soft and faint inks are ink mixed into cloud, at the shares tokens.css gives.
      const soft = mix(ink, cloud, 0.68);
      const faint = mix(ink, cloud, 0.58);

      for (const [what, text, ground] of [
        ["ink on cloud", ink, cloud],
        ["ink on milk", ink, milk],
        ["soft ink on cloud", soft, cloud],
        ["soft ink on milk", soft, milk],
        ["faint ink on cloud", faint, cloud],
        ["faint ink on milk", faint, milk],
      ]) {
        const ratio = contrast(text, ground);
        assert.ok(ratio >= 4.5, `${theme}: ${what} is ${ratio.toFixed(2)} to 1`);
      }
    }
  });
}
