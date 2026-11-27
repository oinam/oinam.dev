/*
 * The site's headings are in Fraunces, served from /assets/fonts/. These
 * tests keep the file, its license, and its preload together, and keep it off
 * the two pages that show Base's own fonts.
 */

import assert from "node:assert/strict";
import { existsSync, globSync, readFileSync } from "node:fs";
import { test } from "node:test";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

const css = read("public/assets/site.css");
const FONT = "/assets/fonts/fraunces/fraunces.woff2";
const PRELOAD = `<link rel="preload" href="${FONT}" as="font" type="font/woff2" crossorigin />`;

test("every font the site serves is there, with its license beside it", () => {
  const sources = [...css.matchAll(/src: url\("([^"]+)"\)/g)].map(([, url]) => url);
  assert.deepEqual(sources, [FONT]);
  for (const url of sources) {
    assert.ok(existsSync(new URL(`public${url}`, ROOT)), url);
    assert.ok(existsSync(new URL(`public${url.replace(/[^/]+$/, "license.txt")}`, ROOT)), url);
  }
});

test("each page with the site's styles preloads the heading font, but the two that show Base", () => {
  const pages = globSync("public/**/*.html", {
    cwd: ROOT,
    exclude: (path) => path.startsWith("public/ui/releases/"),
  }).filter((path) => read(path).includes('href="/assets/site.css"'));

  assert.ok(pages.length > 40);
  for (const path of pages) {
    // The formatter may wrap a long tag over lines; read it as one.
    const html = read(path).replace(/\s+/g, " ");
    const base = ["public/garden/index.html", "public/play/index.html"].includes(path);
    assert.equal(
      html.includes('<html lang="en" data-base-fonts>'),
      base,
      `${path}: data-base-fonts`,
    );
    assert.equal(html.includes(PRELOAD), !base, `${path}: preload`);
  }
});

test("pages marked data-base-fonts keep Base's heading font", () => {
  assert.match(
    css,
    /:root:not\(\[data-base-fonts\]\) \{\n\s+--font-heading: fraunces, var\(--font-serif\);/,
  );
});
