import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { lintCss, lintHtml, parse, RULES } from "../public/ui/tools/lint.js";

const ROOT = new URL("../", import.meta.url);
const TOOL = fileURLToPath(new URL("public/ui/tools/lint.js", ROOT));
const contract = JSON.parse(readFileSync(new URL("public/ui/contract.json", ROOT), "utf8"));

/** The rules a piece of markup breaks, in order. */
const html = (markup) => lintHtml(markup, contract).map((finding) => finding.rule);
const css = (rules) => lintCss(rules).map((finding) => finding.rule);

/* Reading the page */

test("the reader finds elements, their attributes, and the lines they start on", () => {
  const { nodes } = parse(
    '<main>\n  <o-stack gap="2" hidden>\n    <p class=lede>Hi</p>\n  </o-stack>\n</main>',
  );

  assert.deepEqual(
    nodes.map(({ tag, line }) => [tag, line]),
    [
      ["main", 1],
      ["o-stack", 2],
      ["p", 3],
    ],
  );
  assert.deepEqual(nodes[1].attrs, { gap: "2", hidden: "" });
  assert.equal(nodes[2].attrs.class, "lede");
  assert.equal(nodes[2].parent, nodes[1]);
});

test("the reader does not take what is in a script, a style, or a comment for markup", () => {
  const { nodes } = parse(
    "<script>if (a < b) document.write('<o-nonsense>')</script><!-- <o-gone> --><p>x</p>",
  );
  assert.deepEqual(
    nodes.map((node) => node.tag),
    ["script", "p"],
  );
});

/* The system's own elements */

test("a clean page has nothing to mend", () => {
  assert.deepEqual(
    html(`
      <main>
        <o-wrap narrow>
          <o-stack gap="6" align="start">
            <h1>Tide table</h1>
            <p class="lede">High water for the week.</p>
            <o-row>
              <button class="button" type="button">Book a berth</button>
              <a class="button" data-variant="ghost" href="/contact/">Contact the office</a>
            </o-row>
          </o-stack>
        </o-wrap>
      </main>`),
    [],
  );
});

test("an element the system does not have is caught", () => {
  assert.deepEqual(html("<o-hero>Welcome</o-hero>"), ["unknown-element"]);
});

test("an attribute an element does not take is caught, with what it does take", () => {
  const [finding] = lintHtml('<o-stack spacing="4"></o-stack>', contract);

  assert.equal(finding.rule, "unknown-attribute");
  assert.match(finding.message, /It takes: gap, align\./);
});

test("a value an attribute does not take is caught, with the ones it does", () => {
  const [finding] = lintHtml('<o-stack gap="5"></o-stack>', contract);

  assert.equal(finding.rule, "unknown-value");
  assert.match(finding.message, /Use one of: 1, 2, 3, 4, 6, 8, 12, 16\./);
});

test("attributes every element takes, and aria- and data- ones, are left alone", () => {
  assert.deepEqual(
    html('<o-card id="a" class="b" role="group" aria-label="c" data-x="d" hidden></o-card>'),
    [],
  );
});

test("a class of the system on the wrong element is caught", () => {
  assert.deepEqual(html('<div class="button">Save</div>'), ["wrong-element"]);
});

test("a variant a class does not have is caught", () => {
  assert.deepEqual(
    html('<button class="button" data-variant="primary" type="button">Save</button>'),
    ["unknown-value"],
  );
});

test("an element without the part it is built around is caught", () => {
  assert.deepEqual(html("<o-table><p>No table here</p></o-table>"), ["missing-part"]);
  assert.deepEqual(html("<o-tabs><div>One</div></o-tabs>"), ["missing-part"]);
  assert.deepEqual(html('<o-tooltip><button type="button">Go</button></o-tooltip>'), [
    "missing-part",
  ]);
});

test("a card inside a card is caught, however deep", () => {
  assert.deepEqual(html("<o-card><o-stack><o-card>Inner</o-card></o-stack></o-card>"), [
    "nested-card",
  ]);
});

/* Habits */

test("two solid buttons side by side are caught, once", () => {
  assert.deepEqual(
    html(
      '<o-row><button class="button" type="button">Save</button><button class="button" type="button">Publish</button><button class="button" type="button">Send</button></o-row>',
    ),
    ["two-solid-buttons"],
  );
});

test("a solid button beside quieter or disabled ones is fine", () => {
  assert.deepEqual(
    html(
      '<o-row><button class="button" type="button">Save</button><button class="button" data-variant="outline" type="button">Preview</button><button class="button" type="button" disabled>Send</button></o-row>',
    ),
    [],
  );
});

test("a style attribute is caught", () => {
  assert.deepEqual(html('<p style="color: red">Hi</p>'), ["inline-style"]);
});

test("script written into the page is caught; a linked script and data are not", () => {
  assert.deepEqual(html("<script>window.print()</script>"), ["inline-script"]);
  assert.deepEqual(html('<button class="button" type="button" onclick="print()">Print</button>'), [
    "inline-script",
  ]);
  assert.deepEqual(html('<script type="module" src="page.js"></script>'), []);
  assert.deepEqual(html('<script type="application/ld+json">{"@type": "Place"}</script>'), []);
});

test("an emoji is caught, but an arrow or a command sign is type", () => {
  assert.deepEqual(html("<p>Launch \u{1F680}</p>"), ["emoji"]);
  assert.deepEqual(html("<p>Press ⌘K, then →</p>"), []);
});

test("the system linked from oinam.dev is caught; a link to the site is not", () => {
  assert.deepEqual(html('<link rel="stylesheet" href="https://oinam.dev/ui/ui.css" />'), [
    "linked-not-copied",
  ]);
  assert.deepEqual(
    html(
      '<link rel="canonical" href="https://oinam.dev/ui/" /><a href="https://oinam.dev/ui/">Components</a>',
    ),
    [],
  );
});

/* Names */

test("a control with no label is caught", () => {
  assert.deepEqual(html('<input class="input" type="text" />'), ["unnamed-control"]);
});

test("a control is named by a label for it, a label around it, or aria-label", () => {
  assert.deepEqual(html('<label for="a">Name</label><input class="input" id="a" />'), []);
  assert.deepEqual(html('<label class="choice"><input type="checkbox" /> Remember me</label>'), []);
  assert.deepEqual(html('<input class="input" type="search" aria-label="Search" />'), []);
});

test("a button with nothing to call it is caught; an icon with a name is fine", () => {
  assert.deepEqual(
    html('<button class="button" data-size="icon" type="button"><svg></svg></button>'),
    ["unnamed-button"],
  );
  assert.deepEqual(
    html(
      '<button class="button" data-size="icon" type="button" aria-label="Close"><svg></svg></button>',
    ),
    [],
  );
  assert.deepEqual(html('<a href="/"><img src="/logo.svg" alt="Home" /></a>'), []);
});

test("a picture with no alt is caught; an empty alt is a choice", () => {
  assert.deepEqual(html('<img src="/a.jpg" />'), ["missing-alt"]);
  assert.deepEqual(html('<img src="/a.jpg" alt="" />'), []);
});

/* Structure */

test("a second h1, and a skipped level, are caught", () => {
  assert.deepEqual(html("<h1>One</h1><h1>Two</h1>"), ["heading-order"]);
  assert.deepEqual(html("<h1>One</h1><h3>Three</h3>"), ["heading-order"]);
  assert.deepEqual(html("<h1>One</h1><h2>Two</h2><h3>Three</h3><h2>Two again</h2>"), []);
});

test("headings inside a dialog are their own outline", () => {
  assert.deepEqual(html('<h1>Page</h1><dialog class="dialog" id="d"><h2>Sure?</h2></dialog>'), []);
});

test("an id used twice is caught", () => {
  assert.deepEqual(html('<p id="a">One</p><p id="a">Two</p>'), ["duplicate-id"]);
});

test("an attribute that points at a missing id is caught", () => {
  assert.deepEqual(html('<label for="nope">Name</label>'), ["broken-reference"]);
  assert.deepEqual(html('<button type="button" popovertarget="nope">Open</button>'), [
    "broken-reference",
  ]);
  assert.deepEqual(
    html('<button type="button" commandfor="nope" command="show-modal">Open</button>'),
    ["broken-reference"],
  );
  assert.deepEqual(html('<a href="#nope">Jump</a>'), ["broken-reference"]);
  assert.deepEqual(html('<a href="#here">Jump</a><h2 id="here">Here</h2>'), []);
});

/* Stylesheets */

test("a color written out is caught, in any notation", () => {
  assert.deepEqual(css(".a { color: #333; }"), ["raw-color"]);
  assert.deepEqual(css(".a { background: rgb(0 0 0 / 50%); }"), ["raw-color"]);
  assert.deepEqual(css(".a { border: 1px solid oklch(0.5 0.1 200); }"), ["raw-color"]);
});

test("a token is where a raw value belongs, so it may hold one", () => {
  assert.deepEqual(css(":root { --color-ink: light-dark(#1b1a17, #f2efe8); }"), []);
  assert.deepEqual(
    css(
      ".a { color: var(--color-ink); background: color-mix(in oklab, var(--color-ink) 6%, transparent); }",
    ),
    [],
  );
});

test("a font written out is caught; naming one in @font-face is not", () => {
  assert.deepEqual(css(".a { font-family: Helvetica, sans-serif; }"), ["raw-font"]);
  assert.deepEqual(css(".a { font-family: var(--font-mono); }"), []);
  assert.deepEqual(css('@font-face { font-family: "Geist"; src: url("geist.woff2"); }'), []);
});

test("a gradient, forced capitals, and !important are caught", () => {
  assert.deepEqual(css(".a { background: linear-gradient(red, blue); }"), ["gradient"]);
  assert.deepEqual(css(".a { text-transform: uppercase; }"), ["capitals"]);
  assert.deepEqual(css(".a { margin: 0 !important; }"), ["important"]);
});

test("a finding says which line of the stylesheet it is on", () => {
  const [finding] = lintCss(
    "/* A comment\n   over two lines */\n.a {\n  margin: 0;\n  color: #333;\n}\n",
  );
  assert.equal(finding.line, 5);
});

test("a style element in a page is checked as a stylesheet, at the page's line", () => {
  const [finding] = lintHtml("<p>Hi</p>\n<style>\n  .a { color: #333; }\n</style>", contract);

  assert.equal(finding.rule, "raw-color");
  assert.equal(finding.line, 3);
});

/* Setting a rule aside */

test("a rule can be set aside for a line, with a reason", () => {
  assert.deepEqual(
    html(
      '<o-row>\n<button class="button" type="button">Yes</button>\n<!-- lint-allow two-solid-buttons: the two are equal choices -->\n<button class="button" type="button">No</button>\n</o-row>',
    ),
    [],
  );
  assert.deepEqual(
    css(
      "/* lint-allow gradient: this draws an arrow */\n.a { background: linear-gradient(red, blue); }",
    ),
    [],
  );
});

test("setting a rule aside without a reason does not work", () => {
  assert.deepEqual(
    css("/* lint-allow gradient */\n.a { background: linear-gradient(red, blue); }"),
    ["gradient"],
  );
});

test("setting one rule aside does not set aside another", () => {
  assert.deepEqual(css("/* lint-allow gradient: an arrow */\n.a { color: #333; }"), ["raw-color"]);
});

/* Setting rules aside for a region: old content a site must not edit, inside a template that it can */

const OLD_POST =
  "<h1>Archive</h1>\n" +
  "<!-- lint-allow-start heading-order missing-alt: posts from before the system, kept as written -->\n" +
  "<o-prose>\n<h4>2006</h4>\n<img src=a.png>\n</o-prose>\n" +
  "<!-- lint-allow-end -->\n" +
  "<h2>Since</h2>\n<h4>Skipped</h4>\n<img src=b.png>";

test("rules can be set aside for a region, and only inside it", () => {
  const findings = lintHtml(OLD_POST, contract);
  assert.deepEqual(
    findings.map(({ rule, line }) => [rule, line]),
    [
      ["heading-order", 9],
      ["missing-alt", 10],
    ],
  );
});

test("headings in a region set aside are left out of the outline", () => {
  // Without them, the h2 after the region follows the h1, which is in order.
  const findings = lintHtml(OLD_POST.replace("<h4>Skipped</h4>", "<h3>Next</h3>"), contract);
  assert.deepEqual(
    findings.map(({ rule }) => rule),
    ["missing-alt"],
  );
});

test("a region can set every rule aside, with a reason", () => {
  assert.deepEqual(
    html(
      '<!-- lint-allow-start all: an old post -->\n<p style="color: red" onclick="go()">Hi</p>\n<!-- lint-allow-end -->',
    ),
    [],
  );
});

test("a region without a reason, or left open, is itself a finding", () => {
  // Without a reason the start is not one, so the end has nothing to close.
  assert.deepEqual(
    html("<!-- lint-allow-start missing-alt -->\n<img src=a.png>\n<!-- lint-allow-end -->"),
    ["missing-alt", "unclosed-allow"],
  );
  assert.deepEqual(html("<!-- lint-allow-start missing-alt: old -->\n<img src=a.png>"), [
    "unclosed-allow",
  ]);
  assert.deepEqual(html("<p>Hi</p>\n<!-- lint-allow-end -->"), ["unclosed-allow"]);
  assert.deepEqual(
    css(
      "/* lint-allow-start gradient: arrows */\n.a { background: linear-gradient(red, blue); }\n/* lint-allow-end */",
    ),
    [],
  );
});

/* The theme script, written into the page so the theme is set before the first paint */

test("theme-init.js written into the page as it is, is not inline script", () => {
  // The code, without the comment above it, which shows a closing </script> tag.
  const file = readFileSync(new URL("public/ui/theme-init.js", ROOT), "utf8");
  const init = file.slice(file.indexOf("(function"));
  assert.deepEqual(html(`<head><script>${init}</script></head>`), []);
  // Formatting and comments may differ; the code may not.
  const reformatted = init.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*/g, "\n");
  assert.deepEqual(html(`<head><script>\n${reformatted}\n</script></head>`), []);
  assert.deepEqual(html(`<head><script>${init.replace('"theme"', '"mode"')}</script></head>`), [
    "inline-script",
  ]);
});

test("a style attribute inside an SVG says what to use there instead", () => {
  const [finding] = lintHtml(
    '<svg viewBox="0 0 1 1"><path style="fill: none" d="M0 0"/></svg>',
    contract,
  );
  assert.equal(finding.rule, "inline-style");
  assert.match(finding.message, /fill/);
});

/* The whole thing */

test("every rule that can be reported is explained", () => {
  const reported = new Set(
    readFileSync(TOOL, "utf8")
      .matchAll(/report\(\s*"([a-z-]+)"/g)
      .map(([, rule]) => rule),
  );

  assert.ok(reported.size > 15);
  for (const rule of reported) assert.ok(rule in RULES, `${rule} has no explanation`);
});

test("this site passes its own linter", () => {
  const pages = globSync("public/**/*.html", { cwd: ROOT });
  assert.ok(pages.length >= 5);

  for (const path of [...pages, "public/assets/site.css"]) {
    const source = readFileSync(new URL(path, ROOT), "utf8");
    const findings = path.endsWith(".css") ? lintCss(source) : lintHtml(source, contract);
    assert.deepEqual(findings, [], path);
  }
});

test("from the command line, it exits with 1 and names the file and line", () => {
  const run = (...args) => {
    try {
      return { code: 0, out: execFileSync("node", [TOOL, ...args], { encoding: "utf8" }) };
    } catch (error) {
      return { code: error.status, out: error.stdout };
    }
  };

  assert.deepEqual(run("public/index.html"), { code: 0, out: "Clean: 1 files.\n" });

  const bad = run("--json", "tests/fixtures/untidy.html");
  assert.equal(bad.code, 1);
  assert.deepEqual(
    JSON.parse(bad.out).results[0].findings.map(({ rule, line }) => [rule, line]),
    [
      ["unknown-element", 3],
      ["unknown-value", 4],
    ],
  );
});

test("a badge with a tone must say its status in words", () => {
  assert.deepEqual(html('<o-badge tone="success"></o-badge>'), ["wordless-tone"]);
  assert.deepEqual(html('<o-badge tone="success">  </o-badge>'), ["wordless-tone"]);
  assert.deepEqual(html('<o-badge tone="success">Verified</o-badge>'), []);
  assert.deepEqual(html('<o-badge tone="purple">Verified</o-badge>'), ["unknown-value"]);
});
