/*
 * The site is plain HTML, CSS, and JavaScript, served as written. These tests
 * keep it so: nothing to install to run it, nothing bundled, and nothing
 * fetched from anyone else.
 */

import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { test } from "node:test";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
// The released versions are frozen copies of files checked here when they were current.
const released = (path) => path.startsWith("public/ui/releases/");
const find = (pattern) => globSync(pattern, { cwd: ROOT, exclude: released });

test("the site ships no dependencies, only tools for working on it", () => {
  const manifest = JSON.parse(read("package.json"));
  assert.equal(manifest.dependencies, undefined);
});

test("scripts import only the files beside them", () => {
  // The tools run in Node, on the project's machine, and may use what Node provides.
  const tools = /^public\/ui\/tools\//;

  for (const path of find("public/**/*.js")) {
    if (tools.test(path)) continue;
    const imports = [...read(path).matchAll(/^import\s[^"']*["']([^"']+)["']/gm)];
    for (const [, specifier] of imports) {
      assert.match(specifier, /^\.\//, `${path} imports "${specifier}"`);
    }
  }
});

test("the tools use Node itself, and nothing that has to be installed", () => {
  for (const path of find("public/ui/tools/**/*.js")) {
    const imports = [...read(path).matchAll(/^import\s[^"']*["']([^"']+)["']/gm)];
    for (const [, specifier] of imports) {
      assert.match(specifier, /^(node:|\.\.?\/)/, `${path} imports "${specifier}"`);
    }
  }
});

test("stylesheets import only the files beside them", () => {
  for (const path of find("public/**/*.css")) {
    const imports = [...read(path).matchAll(/@import\s+url\(["']([^"']+)["']\)/g)];
    for (const [, url] of imports) {
      assert.match(url, /^[a-z-]+\.css$/, `${path} imports "${url}"`);
    }
  }
});

test("pages load scripts and styles from the site itself", () => {
  const loads = /<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"[^>]*>/g;

  for (const path of find("public/**/*.html")) {
    for (const [tag, url] of read(path).matchAll(loads)) {
      // A link may point elsewhere when it only names a page; loading is what matters.
      if (/rel="(?:canonical|alternate)"/.test(tag)) continue;
      // From the site's root, or from beside the page: never from another site.
      assert.match(url, /^(\/(?!\/)|\.\.?\/|[a-z0-9-]+\.(css|js)$)/, `${path} loads "${url}"`);
    }
  }
});

test("no page carries an inline style or an inline script", () => {
  for (const path of find("public/**/*.html")) {
    const html = read(path);
    assert.doesNotMatch(html, /<[a-z][^>]*\sstyle="/, `${path} has a style attribute`);
    assert.doesNotMatch(html, /<style[\s>]/, `${path} has a <style> element`);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/, `${path} has an inline script`);
  }
});

test("the front door sends an agent on to the guide, in so many words", () => {
  const home = read("public/index.html");
  const main = home.slice(home.indexOf("<main"));

  // The address is written out in full, because an agent may see the text without the link.
  assert.match(main, /<a href="\/ui\/guide\.md"\s*>https:\/\/oinam\.dev\/ui\/guide\.md<\/a\s*>/);
  assert.match(main, /If you are that agent/);
  assert.match(
    home,
    /<link[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*href="\/ui\/guide\.md"/,
  );
});

test("the line to hand an agent names the bare address and nothing more", () => {
  for (const path of ["public/index.html", "public/ui/index.html"]) {
    assert.ok(read(path).includes("Read https://oinam.dev/ and build the page with it."), path);
  }
});

test("no page shows a stray escape where a line break was meant", () => {
  for (const path of find("public/**/*.html")) {
    assert.doesNotMatch(read(path), /\\n/, path);
  }
});

test("the license is on the site, word for word, and every footer links to it", () => {
  // Many readers are agents that never visit the repository, so the license cannot live only there.
  const words = (text) =>
    text
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const page = read("public/license/index.html").replaceAll("&quot;", '"');
  assert.ok(words(page).includes(words(read("LICENSE"))), "the page does not carry LICENSE");

  for (const path of find("public/**/*.html")) {
    const html = read(path);
    if (!html.includes('class="site-footer"')) continue;
    assert.match(
      html,
      /<a href="\/license\/">MIT license<\/a>/,
      `${path} does not link the license`,
    );
  }
});
