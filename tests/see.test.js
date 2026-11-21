/*
 * see.js drives a real browser, so these tests need one. Where there is none
 * they are skipped, not failed.
 */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { findBrowser, see, serve } from "../public/ui/tools/see.js";

const skip = findBrowser() ? false : "no browser on this machine";

/** A PNG says how wide and tall it is in bytes 16 to 23. */
function size(file) {
  const bytes = readFileSync(file);
  assert.equal(bytes.toString("latin1", 1, 4), "PNG");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

let site, out, server;

before(async () => {
  site = mkdtempSync(join(tmpdir(), "oinam-see-site-"));
  out = mkdtempSync(join(tmpdir(), "oinam-see-out-"));
  mkdirSync(join(site, "wide"));

  const page = (body) =>
    `<!doctype html><html lang="en"><meta name="color-scheme" content="light dark"><title>t</title><body>${body}`;
  writeFileSync(join(site, "index.html"), page("<h1>Fits</h1><p>Short.</p>"));
  writeFileSync(
    join(site, "wide/index.html"),
    page('<pre id="wide">' + "x".repeat(400) + "</pre>"),
  );
  writeFileSync(join(site, "broken.html"), page("<script>nothingByThisName()</script><p>Hi</p>"));
  writeFileSync(
    join(site, "themed.html"),
    page(
      "<script>document.title = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; document.body.dataset.theme = document.title</script><p>Hi</p><style>body { margin: 0; background: light-dark(white, black); height: 50px }</style>",
    ),
  );
  server = await serve(site);
});

after(() => {
  server.close();
  rmSync(site, { recursive: true, force: true });
  rmSync(out, { recursive: true, force: true });
});

test("it saves one picture for each width and theme, as wide as asked", { skip }, async () => {
  const seen = await see(`${server.url}/`, { out, widths: [320, 800], themes: ["light", "dark"] });

  assert.deepEqual(
    seen.map(({ width, theme }) => `${width} ${theme}`),
    ["320 light", "800 light", "320 dark", "800 dark"],
  );
  for (const { file, width, height } of seen) {
    assert.match(file, new RegExp(`home-${width}-(light|dark)\\.png$`));
    assert.deepEqual(size(file), [width, height]);
  }
});

test("a page that fits has nothing to report", { skip }, async () => {
  const [one] = await see(`${server.url}/`, { out, widths: [320], themes: ["light"] });

  assert.equal(one.overflow, 0);
  assert.deepEqual(one.errors, []);
});

test("a page that runs off the side is caught, at the width where it does", { skip }, async () => {
  const [narrow, wide] = await see(`${server.url}/wide/`, {
    out,
    widths: [320, 4000],
    themes: ["light"],
  });

  assert.ok(narrow.overflow > 0, "at 320 the long line does not fit");
  assert.equal(wide.overflow, 0);
  assert.match(narrow.file, /wide-320-light\.png$/);
});

test("an error the page throws is reported", { skip }, async () => {
  const [one] = await see(`${server.url}/broken.html`, { out, widths: [320], themes: ["light"] });

  assert.equal(one.errors.length, 1);
  assert.match(one.errors[0], /nothingByThisName/);
});

test("the dark picture is of the page in its dark theme", { skip }, async () => {
  const [light, dark] = await see(`${server.url}/themed.html`, {
    out,
    widths: [320],
    themes: ["light", "dark"],
  });

  // The page paints itself white or black; the pictures should differ, and by a lot.
  const [a, b] = [readFileSync(light.file), readFileSync(dark.file)];
  assert.notDeepEqual(a, b);
});

test("the server stays inside its folder", async () => {
  const outside = await fetch(`${server.url}/%2e%2e/%2e%2e/etc/hosts`);
  assert.notEqual(outside.status, 200);

  const missing = await fetch(`${server.url}/nothing-here.html`);
  assert.equal(missing.status, 404);
});
