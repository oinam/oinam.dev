/*
 * The color pages. The list in public/colors/colors.json is kept by hand and the
 * pages are written from it by scripts/colors.js, so these tests hold the two
 * together, and hold every color to the same contrast the garden is held to.
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { contrast, hex, mix, parse, rgb } from "../scripts/color.js";
import { colors, render } from "../scripts/colors.js";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

const all = colors();

test("the pages are as the script writes them from the list", async () => {
  for (const [path, source] of Object.entries(await render())) {
    assert.ok(existsSync(new URL(path, ROOT)), `${path} is missing: run mise run colors`);
    assert.equal(read(path), source, `${path} differs from the list: run mise run colors`);
  }
});

test("nothing is left in public/colors/ that the script does not write", async () => {
  const written = new Set(Object.keys(await render()));
  const kept = ["public/colors/colors.json"];
  const there = readdirSync(new URL("public/colors/", ROOT), { recursive: true })
    .map((name) => `public/colors/${name}`)
    .filter((path) => /\.(html|css|json)$/.test(path));
  for (const path of there) {
    assert.ok(written.has(path) || kept.includes(path), `${path} is not written by the script`);
  }
});

test("numbers count up from 1, with no zeros in front, and no two colors share a name", () => {
  assert.deepEqual(
    all.map((color) => color.id),
    all.map((_, at) => String(at + 1)),
  );
  const names = all.map((color) => color.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of names) assert.match(name, /^[a-z][a-z-]*$/, name);
});

test("color 1 is Base, as tokens.css has it", () => {
  const tokens = read("public/ui/tokens.css");
  const [base] = all;
  assert.equal(base.name, "base");
  for (const key of ["ink", "cloud", "milk", "accent", "accent-text"]) {
    const value = tokens.match(
      new RegExp(`--color-${key}: light-dark\\((#[0-9a-f]+), (#[0-9a-f]+)\\)`),
    );
    assert.deepEqual(
      base.themes.map((theme) => theme.values[key === "accent-text" ? "accentText" : key].hex),
      [value[1], value[2]].map((written) => hex(rgb(written))),
      key,
    );
  }
});

test("colors are written in OKLCH, the way the style linter asks", () => {
  for (const color of all) {
    for (const key of ["ink", "cloud", "milk", "accent", "accentText"]) {
      for (const value of color[key]) {
        assert.match(
          value,
          /^oklch\(\d+(\.\d+)?% \d+(\.\d+)? \d+(\.\d+)?deg\)$/,
          `${color.id} ${key}`,
        );
      }
    }
  }
});

for (const color of all) {
  test(`${color.id} ${color.name}: keeps text readable, in light and in dark`, () => {
    for (const { theme, ratios } of color.themes) {
      for (const [text, on] of Object.entries(ratios)) {
        for (const [ground, value] of Object.entries(on)) {
          assert.ok(value >= 4.5, `${theme}: ${text} on ${ground} is ${value.toFixed(2)} to 1`);
        }
      }
    }
  });
}

test("a color taken from others says from where, under what license, and the license is here", () => {
  const licenses = read("public/colors/LICENSES.txt");
  for (const color of all.filter((color) => color.from)) {
    const { name, url, license, scale } = color.from;
    assert.match(url, /^https:\/\//, color.id);
    assert.ok(scale, `${color.id} names the scale it is from`);
    assert.equal(license, "MIT", color.id);
    assert.ok(licenses.includes(`== ${name} (`), `${name} is in LICENSES.txt`);
  }
});

test("a color's page answers with its name after the number, or without it", () => {
  const rules = read("public/_redirects");
  assert.match(rules, /^\/colors\/:id\/:name\/ \/colors\/:id\/ 200$/m);
  assert.match(rules, /^\/colors\/:id\/:name \/colors\/:id\/ 200$/m);
});

test("every color's page is in the sitemap", () => {
  const sitemap = read("public/sitemap.xml");
  assert.ok(sitemap.includes("<loc>https://oinam.dev/colors/</loc>"));
  for (const color of all) {
    assert.ok(sitemap.includes(`<loc>https://oinam.dev/colors/${color.id}/</loc>`), color.id);
  }
});

for (const color of all) {
  test(`${color.id} ${color.name}: its accent stands out, and its label reads on it`, () => {
    for (const [at, { theme }] of color.themes.entries()) {
      const [accent, label, ink, cloud, milk] = [
        color.accent[at],
        color.accentText[at],
        color.ink[at],
        color.cloud[at],
        color.milk[at],
      ].map(parse);
      for (const [ground, name] of [
        [cloud, "cloud"],
        [milk, "milk"],
      ]) {
        const edge = contrast(accent, ground);
        assert.ok(edge >= 3, `${theme}: accent on ${name} is ${edge.toFixed(2)} to 1`);
      }
      // button.css leans the hovered accent 15% toward ink.
      for (const [fill, state] of [
        [accent, "at rest"],
        [mix(accent, ink, 0.85), "hovered"],
      ]) {
        const ratio = contrast(label, fill);
        assert.ok(ratio >= 4.5, `${theme}: label ${state} is ${ratio.toFixed(2)} to 1`);
      }
    }
  });
}

test("every take-away stylesheet carries its accent", () => {
  for (const color of all.filter((one) => one.id !== "1")) {
    const css = read(`public/colors/${color.id}.css`);
    assert.ok(
      css.includes(`--color-accent: light-dark(${color.accent[0]}, ${color.accent[1]});`),
      color.id,
    );
    assert.ok(css.includes("--color-accent-text: light-dark("), color.id);
  }
});
