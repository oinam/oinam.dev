/*
 * Each version of the components is also served, frozen, from
 * /ui/releases/<version>/, for sites that link to oinam.dev instead of taking
 * a copy. These tests hold the current release to the files it was made from,
 * and keep scripts/release.js from writing over one already out in the world.
 */

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { linked, release } from "../scripts/release.js";

const UI = fileURLToPath(new URL("../public/ui/", import.meta.url));
const RELEASES = join(UI, "releases");
const registry = JSON.parse(readFileSync(join(UI, "registry.json"), "utf8"));

/** Every file under a folder, as sorted paths relative to it. */
const tree = (folder) =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)))
    .sort();

test("the current version is released, file for file", () => {
  const folder = join(RELEASES, registry.version);
  const files = linked(registry);

  assert.deepEqual(tree(folder), files, `run "mise run release" for ${registry.version}`);
  for (const file of files) {
    // A file that differs means a page that works with one breaks with the other.
    // Change it under a new version, never inside a release.
    assert.ok(
      readFileSync(join(folder, file)).equals(readFileSync(join(UI, file))),
      `${file} has changed since ${registry.version} was released; name a new version`,
    );
  }
});

test("a release holds what a page links, and nothing to read", () => {
  const files = linked(registry);
  assert.ok(files.includes("ui.css") && files.includes("ui.js") && files.includes("tokens.css"));
  assert.ok(files.some((file) => file.startsWith("fonts/") && file.endsWith(".woff2")));
  assert.deepEqual(
    files.filter((file) => !/\.(css|js|woff2|txt)$/.test(file)),
    [],
  );
});

test("every release is a version in the changelog", () => {
  const changelog = readFileSync(join(UI, "CHANGELOG.md"), "utf8");
  for (const version of readdirSync(RELEASES)) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.match(changelog, new RegExp(`^## ${version.replaceAll(".", "\\.")}$`, "m"), version);
  }
});

test("a version is released once, and never written over", () => {
  const ui = mkdtempSync(join(tmpdir(), "oinam-release-"));
  try {
    cpSync(UI, ui, { recursive: true, filter: (path) => !path.startsWith(RELEASES) });

    const first = release(ui);
    assert.equal(first.version, registry.version);
    assert.deepEqual(tree(first.folder), linked(registry));

    assert.throws(() => release(ui), /released already/);
  } finally {
    rmSync(ui, { recursive: true, force: true });
  }
});

test("the guide and the components page link the current release", () => {
  const address = `https://oinam.dev/ui/releases/${registry.version}/`;
  const guide = readFileSync(join(UI, "guide.md"), "utf8");
  const page = readFileSync(join(UI, "index.html"), "utf8");

  for (const [name, text] of [
    ["guide.md", guide],
    ["index.html", page],
  ]) {
    const links = [...text.matchAll(/https:\/\/oinam\.dev\/ui\/releases\/[^/]+\//g)];
    assert.ok(links.length >= 3, `${name} shows how to link a release`);
    for (const [link] of links) assert.equal(link, address, `${name} links ${link}`);
  }
});
