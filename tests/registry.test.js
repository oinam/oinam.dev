/*
 * The system is described in four places, all kept by hand: the files under
 * public/ui/, registry.json, guide.md for agents, and the components page for
 * people. These tests hold the four to one another, so that adding a component
 * to one and forgetting the rest fails here instead of confusing a reader.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const UI = new URL("../public/ui/", import.meta.url);
const read = (name) => readFileSync(new URL(name, UI), "utf8");

const registry = JSON.parse(read("registry.json"));
const guide = read("guide.md");
const page = read("index.html");

/* Every stylesheet and script that belongs to the system, apart from the two that gather them. */
const gathered = [registry.all.css, registry.all.js];
const files = readdirSync(UI).filter(
  (name) => /\.(css|js)$/.test(name) && !gathered.includes(name),
);

const listed = new Set([
  ...registry.foundation,
  registry.all.head,
  ...registry.components.flatMap((component) => component.files),
]);

test("every file in the system is in the registry", () => {
  assert.deepEqual(
    files.filter((name) => !listed.has(name)),
    [],
  );
});

test("every file in the registry exists", () => {
  assert.deepEqual(
    [...listed].filter((name) => !files.includes(name)),
    [],
  );
});

test("ui.css gathers every stylesheet", () => {
  const css = read(registry.all.css);
  const missing = files.filter((name) => name.endsWith(".css") && !css.includes(`"${name}"`));
  assert.deepEqual(missing, []);
});

test("ui.js gathers every element, and nothing that must block the page", () => {
  const js = read(registry.all.js);
  const modules = files.filter((name) => name.endsWith(".js") && name !== registry.all.head);

  assert.deepEqual(
    modules.filter((name) => !js.includes(`"./${name}"`)),
    [],
  );
  assert.ok(!js.includes(registry.all.head));
});

test("a component is marked as needing script exactly when it lists one", () => {
  for (const { name, files, script } of registry.components) {
    const has = files.some((file) => file.endsWith(".js"));
    assert.equal(script, has, name);
  }
});

test("every component is in the guide, under its own heading", () => {
  for (const { title, script } of registry.components) {
    const heading = `### ${title}${script ? " (needs script)" : ""}\n`;
    assert.ok(guide.includes(heading), `guide.md has no "${heading.trim()}"`);
  }
});

test("every component is on the components page, with a link in its contents", () => {
  for (const { name } of registry.components) {
    assert.ok(page.includes(`id="${name}"`), `no specimen with id="${name}"`);
    assert.ok(page.includes(`href="#${name}"`), `no link to #${name}`);
  }
});

test("the guide names every custom element the stylesheets define", () => {
  const css = files
    .filter((name) => name.endsWith(".css"))
    .map(read)
    .join("\n");
  const elements = new Set(css.match(/\bo-[a-z]+\b/g));

  assert.ok(elements.size > 0);
  for (const element of elements) {
    assert.ok(guide.includes(`<${element}`), `guide.md never shows <${element}>`);
  }
});
