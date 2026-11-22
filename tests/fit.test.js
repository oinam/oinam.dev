/*
 * Every page of the site fits a phone, at the widths phones come in. The
 * header steps things aside at breakpoints, by hand, and a breakpoint set a
 * little late leaves the page running off the side for a band of widths that
 * a check at 320 alone never sees. So the widths below cover each band the
 * header has, near its edges.
 *
 * It drives a real browser, through see.js. Where there is none, it is skipped.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

import { findBrowser, see, serve } from "../public/ui/tools/see.js";

const skip = findBrowser() ? false : "no browser on this machine";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));

// The smallest phone, then each side of the header's two narrow breakpoints,
// with the common phones between. Each width is a picture, so there are few.
const WIDTHS = [320, 390, 414, 479, 480, 591, 592];

/** Every page under public/, but not the frozen releases, which hold none. */
function pages(folder = PUBLIC) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return entry.name === "releases" ? [] : pages(path);
    return entry.name.endsWith(".html") ? [relative(PUBLIC, path)] : [];
  });
}

let server, out;

before(async () => {
  server = await serve(PUBLIC);
  out = mkdtempSync(join(tmpdir(), "oinam-fit-"));
});

after(() => {
  server.close();
  rmSync(out, { recursive: true, force: true });
});

test("there are pages to check", () => {
  assert.ok(pages().length >= 10, pages().join(", "));
});

for (const page of pages()) {
  test(`${page} fits a phone at every width`, { skip }, async () => {
    const seen = await see(`${server.url}/${page}`, { out, widths: WIDTHS, themes: ["light"] });
    const over = seen.filter(({ overflow }) => overflow > 0);

    assert.deepEqual(
      over.map(({ width, overflow }) => `${overflow}px over at ${width}`),
      [],
      "nothing is wider than the screen",
    );
  });
}
