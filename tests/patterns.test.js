/*
 * The patterns are what an agent copies from, so each has to be beyond
 * reproach: on the list, explained, built from the system alone, and clean
 * under the system's own linter.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { lintCss, lintHtml, parse } from "../public/ui/tools/lint.js";

const UI = new URL("../public/ui/", import.meta.url);
const read = (name) => readFileSync(new URL(name, UI), "utf8");

const registry = JSON.parse(read("registry.json"));
const contract = JSON.parse(read("contract.json"));
const { pages, stylesheet } = registry.patterns;
// The formatter pads the columns of a table, so compare with the padding taken out.
const guide = read("guide.md").replace(/ +\|/g, " |").replace(/\| +/g, "| ");
const index = read("patterns/index.html").replace(/\s+/g, " ");

test("every pattern in the folder is in the registry, and the other way round", () => {
  const folder = readdirSync(new URL("patterns/", UI))
    .filter((name) => name.endsWith(".html") && name !== "index.html")
    .map((name) => `patterns/${name}`);

  assert.deepEqual(folder.toSorted(), pages.map((page) => page.file).toSorted());
});

test("every pattern is in the guide's table and on the patterns page", () => {
  for (const { name, title, file, shows } of pages) {
    assert.ok(guide.includes(`| \`${file}\` | ${title} |`), `guide.md does not list ${file}`);
    assert.ok(
      index.includes(`href="/ui/patterns/${name}.html">${title}</a>`),
      `${name} is not on the page`,
    );
    assert.ok(index.includes(shows), `${name}: the page does not say what it shows`);
  }
});

for (const { name, title, file } of pages) {
  const source = read(file);
  const { nodes } = parse(source);

  test(`${name}: opens by saying what it is and why it is laid out so`, () => {
    const [, comment] = source.match(/^<!doctype html>\n<!--([\s\S]*?)-->/) ?? [];

    assert.ok(comment, "it must open with a comment");
    assert.ok(comment.includes(`Pattern: ${title}`));
    assert.ok(
      comment.trim().split("\n").length >= 6,
      "the comment should give the reasons, not only the name",
    );
  });

  test(`${name}: passes the linter`, () => {
    assert.deepEqual(lintHtml(source, contract), []);
  });

  test(`${name}: is built from the system and the patterns' stylesheet alone`, () => {
    const sheets = nodes.filter((node) => node.tag === "link" && node.attrs.rel === "stylesheet");
    const scripts = nodes.filter((node) => node.tag === "script");

    assert.deepEqual(
      sheets.map((node) => node.attrs.href),
      ["../ui.css", "patterns.css"],
    );
    assert.deepEqual(
      scripts.map((node) => node.attrs.src),
      ["../theme-init.js", "../ui.js"],
    );
    assert.ok(!nodes.some((node) => node.tag === "style"));
  });

  test(`${name}: has one h1, a main, and a title of its own`, () => {
    assert.equal(nodes.filter((node) => node.tag === "h1").length, 1);
    assert.equal(nodes.filter((node) => node.tag === "main").length, 1);
    assert.ok(nodes.find((node) => node.tag === "title").text.startsWith(title));
  });
}

test("the patterns' stylesheet keeps the rules it teaches", () => {
  assert.equal(stylesheet, "patterns/patterns.css");
  assert.deepEqual(lintCss(read(stylesheet)), []);
});

test("every class the patterns use is the system's, or is in their stylesheet", () => {
  const css = read(stylesheet);
  const known = new Set(Object.keys(contract.classes));

  for (const { file } of pages) {
    for (const node of parse(read(file)).nodes) {
      for (const name of (node.attrs.class ?? "").split(/\s+/).filter(Boolean)) {
        assert.ok(
          known.has(name) || css.includes(`.${name}`),
          `${file}: class "${name}" is styled nowhere`,
        );
      }
    }
  }
});
