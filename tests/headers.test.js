/*
 * The headers Cloudflare Pages sends with every page, from public/_headers.
 * The site is static and loads nothing from anyone else, so the headers can
 * shut every other door: no other origin's scripts, no framing, no form posts,
 * no camera or microphone, and HTTPS only. These tests keep them shut.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const file = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");

/** The headers under one path rule, as a map of lowercased name to value. */
function rule(path) {
  const lines = file.split("\n");
  const start = lines.indexOf(path);
  assert.notEqual(start, -1, `_headers has a rule for ${path}`);
  const headers = new Map();
  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^\s+([A-Za-z-]+):\s*(.+)$/);
    if (!match) break;
    headers.set(match[1].toLowerCase(), match[2]);
  }
  return headers;
}

const all = rule("/*");

test("every page may load only from the site itself", () => {
  const csp = all.get("content-security-policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /base-uri 'none'/);
  assert.match(csp, /form-action 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
});

test("browsers keep to HTTPS, and pages open in a window of their own", () => {
  assert.match(all.get("strict-transport-security") ?? "", /max-age=\d{8,}/);
  assert.equal(all.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(all.get("x-content-type-options"), "nosniff");
});

test("the browser features the site does not use are switched off", () => {
  const policy = all.get("permissions-policy") ?? "";
  for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) {
    assert.match(policy, new RegExp(`(^|, )${feature}=\\(\\)`), feature);
  }
  // The two it does use: the Copy buttons, and the share sheet on the home page.
  assert.match(policy, /clipboard-write=\(self\)/);
  assert.match(policy, /web-share=\(self\)/);
});
