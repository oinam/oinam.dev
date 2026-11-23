/*
 * The tokens are written twice: tokens.css, which a page uses, and tokens.json,
 * the same values in the Design Tokens format for tools that cannot read CSS.
 * Both are kept by hand. These tests hold the second to the first.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { contrast, hex, mix, rgb } from "../scripts/color.js";

const UI = new URL("../public/ui/", import.meta.url);
const EXTENSION = "dev.oinam.ui";

const css = readFileSync(new URL("tokens.css", UI), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const [, root] = css.match(/:root\s*\{([\s\S]*?)\n\}/);

/** Every token in tokens.css, by property, with its white space evened out. */
const declared = Object.fromEntries(
  [...root.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => [
    name,
    value.replace(/\s+/g, " ").trim(),
  ]),
);

const json = JSON.parse(readFileSync(new URL("tokens.json", UI), "utf8"));

/** Every token in tokens.json, flat, each with the type its group gives it. */
const tokens = Object.entries(json)
  .filter(([key]) => !key.startsWith("$"))
  .flatMap(([group, members]) =>
    Object.entries(members)
      .filter(([key]) => !key.startsWith("$"))
      .map(([key, token]) => ({
        path: `${group}.${key}`,
        type: members.$type,
        value: token.$value,
        ...token.$extensions[EXTENSION],
      })),
  );

const size = ({ value, unit }) => `${value}${unit}`;
const pair = (value) => value.match(/#[0-9a-f]{3,6}/g).map(rgb);

test("the file says which format it is in", () => {
  assert.equal(json.$schema, "https://www.designtokens.org/schemas/2025.10/format.json");
});

test("both files hold the same tokens, in the same order", () => {
  assert.deepEqual(
    tokens.map((token) => token.property),
    Object.keys(declared),
  );
});

test("every token carries its exact value in CSS", () => {
  for (const { property, css } of tokens) assert.equal(css, declared[property], property);
});

test("a token's place in the file follows from its name", () => {
  for (const { path, property } of tokens) {
    const [group, key] = path.split(/\.(.*)/);
    assert.equal(property, key === "default" ? `--${group}` : `--${group}-${key}`);
  }
});

test("sizes say what the CSS says", () => {
  for (const { type, value, css, property } of tokens) {
    if (type !== "dimension") continue;
    // The one fluid size is given at its largest; the rule itself is in `css`.
    const expected = css.startsWith("clamp(") ? css.match(/, ([\d.]+rem)\)$/)[1] : css;
    assert.equal(size(value), expected, property);
  }
});

test("the two colors that are chosen are given exactly, light and dark", () => {
  for (const { type, value, dark, css, property } of tokens) {
    if (type !== "color" || !css.startsWith("light-dark(")) continue;
    const [light, night] = pair(css).map(hex);

    assert.equal(value.hex, light, `${property}, light`);
    assert.equal(dark.hex, night, `${property}, dark`);
  }
});

test("the colors that are mixed are given as the browser mixes them", () => {
  const [inkLight, inkDark] = pair(declared["--color-ink"]);
  const [cloudLight, cloudDark] = pair(declared["--color-cloud"]);

  for (const { type, value, dark, css, property } of tokens) {
    const [, share, into] =
      css.match(/^color-mix\(in oklab, var\(--color-ink\) (\d+)%, (.+)\)$/) ?? [];
    if (type !== "color" || !share) continue;

    if (into === "transparent") {
      assert.equal(value.alpha, share / 100, property);
      assert.equal(dark.alpha, share / 100, property);
      assert.equal(value.hex, hex(inkLight), property);
      assert.equal(dark.hex, hex(inkDark), property);
    } else {
      assert.equal(into, "var(--color-cloud)", property);
      assert.equal(value.hex, hex(mix(inkLight, cloudLight, share / 100)), `${property}, light`);
      assert.equal(dark.hex, hex(mix(inkDark, cloudDark, share / 100)), `${property}, dark`);
    }
  }
});

test("a color's numbers and its hex are the same color", () => {
  for (const { type, value, dark, property } of tokens) {
    if (type !== "color") continue;
    for (const color of [value, dark]) {
      const fromNumbers = color.components.map((part) => Math.round(part * 255));
      const fromHex = [1, 3, 5].map((at) => parseInt(color.hex.slice(at, at + 2), 16));
      assert.deepEqual(fromNumbers, fromHex, property);
    }
  }
});

test("font stacks, times, and curves say what the CSS says", () => {
  for (const { type, value, css, property } of tokens) {
    if (type === "fontFamily" && Array.isArray(value)) {
      assert.deepEqual(
        value,
        css.split(",").map((name) => name.trim().replace(/^"|"$/g, "")),
        property,
      );
    } else if (type === "fontFamily") {
      // One family standing for another: {font.serif} is var(--font-serif).
      assert.equal(`var(--${value.slice(1, -1).replace(".", "-")})`, css, property);
    } else if (type === "duration") {
      assert.equal(size(value), css, property);
    } else if (type === "cubicBezier") {
      assert.equal(`cubic-bezier(${value.join(", ")})`, css, property);
    } else if (type === "number") {
      assert.equal(String(value), css, property);
    }
  }
});

test("shadows say what the CSS says", () => {
  for (const { type, value, css, property } of tokens) {
    if (type !== "shadow") continue;
    const part = (length) => (length.value === 0 ? "0" : size(length));
    const written = `${part(value.offsetX)} ${part(value.offsetY)} ${part(value.blur)} rgb(0 0 0 / ${Math.round(value.color.alpha * 100)}%)`;
    assert.equal(written, css, property);
  }
});

test("each status color reads on its own fill, in light and in dark", () => {
  const statuses = ["success", "warning", "danger", "info"];
  for (const status of statuses) {
    const text = pair(declared[`--color-${status}`]);
    const fill = pair(declared[`--color-${status}-fill`]);
    for (const [at, theme] of ["light", "dark"].entries()) {
      const ratio = contrast(text[at], fill[at]);
      assert.ok(ratio >= 4.5, `${status}, ${theme}: ${ratio.toFixed(2)} to 1`);
    }
  }
});
