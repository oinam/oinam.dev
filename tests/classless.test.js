/*
 * classless.css is the way in for a page with no classes at all. These tests
 * hold it to that: it selects on elements and attributes only, it reads every
 * value from the tokens, and it sits below the components, so a page that
 * moves on to them by linking ui.css gets the components where both speak.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const UI = new URL("../public/ui/", import.meta.url);
const read = (name) => readFileSync(new URL(name, UI), "utf8");

const registry = JSON.parse(read("registry.json"));
const sheet = read(registry.all.classless);
// Comments show markup with classes in it; only the rules are held to this.
const rules = sheet.replace(/\/\*[\s\S]*?\*\//g, "");

/** The selectors of every rule, with the strings and values taken out. */
const selectors = () =>
  [...rules.matchAll(/([^{};]+)\{/g)]
    .map(([, selector]) => selector.trim())
    .filter((selector) => !selector.startsWith("@"));

/** The order a stylesheet declares its layers in. */
const layers = (css) => css.match(/^@layer ([a-z, ]+);$/m)[1].split(/,\s*/);

test("the registry names the classless sheet, and it opens with its markup", () => {
  assert.equal(registry.all.classless, "classless.css");
  assert.match(sheet, /^\/\*\n \* Classless\n/);
  assert.ok(sheet.includes('<link rel="stylesheet" href="ui/classless.css" />'));
});

test("it brings the same tokens and Base as ui.css, in the same layers", () => {
  for (const name of ["tokens", "base"]) {
    const line = `@import url("${name}.css") layer(${name});`;
    assert.ok(sheet.includes(line), `classless.css does not import ${name}.css`);
    assert.ok(read("ui.css").includes(line), `ui.css does not import ${name}.css`);
  }
});

test("its layer comes after Base and before the components", () => {
  const own = layers(sheet);
  const all = layers(read("ui.css"));

  // ui.css's layers, in its order, with classless between base and layout.
  assert.deepEqual(
    own.filter((layer) => layer !== "classless"),
    all,
  );
  assert.ok(own.indexOf("classless") > own.indexOf("base"));
  assert.ok(own.indexOf("classless") < own.indexOf("layout"));
});

test("it selects no class and no onm- element", () => {
  const found = selectors();
  assert.ok(found.length > 20);
  for (const selector of found) {
    assert.doesNotMatch(selector, /(^|[\s,(>+~])\.[a-z]/, selector);
    assert.doesNotMatch(selector, /\bonm-[a-z]/, selector);
  }
});

test("every token it reads exists", () => {
  const tokens = new Set(read("tokens.css").match(/--[a-z0-9-]+(?=:)/g));
  const used = new Set(rules.match(/var\((--[a-z0-9-]+)/g).map((call) => call.slice(4)));

  assert.ok(used.size > 10);
  for (const token of used) assert.ok(tokens.has(token), `${token} is not a token`);
});

test("it writes no color out, so a variation changes it as it changes the components", () => {
  assert.doesNotMatch(rules, /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(/i);
});
