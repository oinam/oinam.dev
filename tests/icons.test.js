/*
 * The icons are Phosphor's, copied untouched by scripts/icons.js. These hold
 * the folder to the list, the license to the icons, and the site's own pages
 * to icons drawn from the set rather than by hand.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { WEIGHTS } from "../scripts/icons.js";

const UI = new URL("../public/ui/", import.meta.url);
const ICONS = new URL("icons/", UI);
const read = (path, base = UI) => readFileSync(new URL(path, base), "utf8");

const registry = JSON.parse(read("registry.json"));
const manifest = JSON.parse(read("icons.json", ICONS));

/** The file of `name` in `weight`: regular has no suffix, the others end in their weight. */
const file = (name, weight) =>
  `phosphor/${weight}/${weight === "regular" ? name : `${name}-${weight}`}.svg`;

test("the registry and the list agree on the set", () => {
  const { icons } = registry;
  assert.equal(icons.set, "Phosphor");
  assert.equal(icons.version, manifest.version);
  assert.equal(icons.license, manifest.license);
  assert.deepEqual(icons.weights, WEIGHTS);
  assert.deepEqual(manifest.weights, WEIGHTS);
  assert.ok(registry.docs.includes("icons.md"));
  assert.ok(existsSync(new URL(icons.list, UI)));
});

test("every icon in the list is there in every weight, and nothing else is", () => {
  const names = manifest.icons.map((icon) => icon.name);
  assert.ok(names.length > 1000, `only ${names.length} icons`);
  assert.equal(new Set(names).size, names.length, "a name is listed twice");

  for (const weight of WEIGHTS) {
    const present = readdirSync(new URL(`phosphor/${weight}/`, ICONS)).toSorted();
    const expected = names.map((name) => file(name, weight).split("/").pop()).toSorted();
    assert.deepEqual(present, expected, `${weight} does not match the list`);
  }
});

test("Phosphor's license is beside the icons", () => {
  const license = read("phosphor/LICENSE.txt", ICONS);
  assert.match(license, /^MIT License/);
  assert.match(license, /Phosphor Icons/);
});

test("every icon takes the color of its text and nothing else", () => {
  for (const weight of WEIGHTS) {
    for (const name of ["magnifying-glass", "trash", "sun", "github-logo"]) {
      const svg = read(file(name, weight), ICONS);
      assert.match(svg, /viewBox="0 0 256 256"/);
      assert.match(svg, /fill="currentColor"/);
      assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgb\(|stroke=/i, `${name} in ${weight}`);
    }
  }
});

test("the site's icons are drawn from the set", () => {
  const regular = new Map(
    manifest.icons.map(({ name }) => {
      const svg = read(file(name, "regular"), ICONS);
      return [svg.match(/ d="([^"]+)"/)[1], name];
    }),
  );
  const pages = execFileSync("git", ["ls-files", "public"], { encoding: "utf8" })
    .split("\n")
    .filter((path) => /\.(html|js)$/.test(path) && !path.includes("/releases/"));

  let seen = 0;
  for (const path of pages) {
    const text = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    for (const [svg] of text.matchAll(/<svg\s+class="icon[^"]*".*?<\/svg>/gs)) {
      seen += 1;
      assert.match(svg, /viewBox="0 0 256 256"/, `${path} has an icon not from the set`);
      for (const [, d] of svg.matchAll(/\sd="([^"]+)"/g)) {
        assert.ok(regular.has(d), `${path} has an icon drawn by hand`);
      }
    }
  }
  assert.ok(seen > 0, "no icons found on the site");
});
