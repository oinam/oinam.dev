/*
 * The color pages. The list in public/colors/colors.json is kept by hand and the
 * pages are written from it by scripts/colors.js, so these tests hold the two
 * together, and hold every color to the same contrast the garden is held to.
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

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

test("numbers count up from 00, and no two colors share a name", () => {
  assert.deepEqual(
    all.map((color) => color.id),
    all.map((_, at) => String(at).padStart(2, "0")),
  );
  const names = all.map((color) => color.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of names) assert.match(name, /^[a-z][a-z-]*$/, name);
});

test("color 00 is Base, as tokens.css has it", () => {
  const tokens = read("public/ui/tokens.css");
  const [base] = all;
  assert.equal(base.name, "base");
  for (const key of ["ink", "cloud", "milk"]) {
    const value = tokens.match(
      new RegExp(`--color-${key}: light-dark\\((#[0-9a-f]+), (#[0-9a-f]+)\\)`),
    );
    assert.deepEqual(base[key], [value[1], value[2]], key);
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
