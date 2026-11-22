/*
 * What a link shows when it is shared. The tags are written by hand in each
 * page, with no build step to keep them, so these tests keep them honest: every
 * page of the site carries the set, each names its own address, and the picture
 * they point at is there, at the size the tags say.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

// Every page in the sitemap: the pages people are meant to find, and so to
// share. The pattern samples and the 404 are not in it, and need no card.
const PAGES = [
  ...read("public/sitemap.xml").matchAll(/<loc>https:\/\/oinam\.dev\/([^<]*)<\/loc>/g),
].map(([, path]) => `public/${path}index.html`);

const IMAGE = "https://oinam.dev/assets/social.png";

/** The content of a meta tag, by its property or name. */
function meta(html, key) {
  const tag = new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`);
  return html.match(tag)?.[1];
}

test("the sitemap names the pages to check", () => {
  assert.ok(PAGES.length >= 6, PAGES.join(", "));
});

for (const path of PAGES) {
  test(`${path} says what to show when it is shared`, () => {
    const html = read(path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

    assert.ok(canonical, "it has a canonical address");
    assert.equal(meta(html, "og:url"), canonical, "og:url is the canonical address");
    for (const key of ["og:type", "og:site_name", "og:title", "og:description", "og:image:alt"]) {
      assert.ok(meta(html, key), `it has ${key}`);
    }
    assert.equal(meta(html, "og:image"), IMAGE);
    assert.equal(meta(html, "og:image:width"), "1200");
    assert.equal(meta(html, "og:image:height"), "630");
    assert.equal(meta(html, "twitter:card"), "summary_large_image");
  });
}

test("the shared picture is a PNG, 1200 by 630", () => {
  const png = readFileSync(new URL("public/assets/social.png", ROOT));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  // The first chunk is IHDR: width, then height, each four bytes, big-endian.
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test("the share links on the home page all carry its address", () => {
  const html = read("public/index.html");
  const share = html.match(/<ul class="share-links"[\s\S]*?<\/ul>/)?.[0] ?? "";
  const links = [...share.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  assert.ok(links.length >= 6, "there are share links");
  for (const href of links) {
    assert.match(href, /https%3A%2F%2Foinam\.dev%2F/, href);
  }
});
