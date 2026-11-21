import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

import { INSTRUCTION, report } from "../evals/run.js";
import { score } from "../evals/score.js";

const ROOT = new URL("../", import.meta.url);
const contract = JSON.parse(readFileSync(new URL("public/ui/contract.json", ROOT), "utf8"));

const made = [];
after(() => made.forEach((folder) => rmSync(folder, { recursive: true, force: true })));

/** A folder such as an agent leaves behind, holding the files given. */
function project(files) {
  const folder = mkdtempSync(join(tmpdir(), "oinam-eval-"));
  made.push(folder);
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(folder, name, ".."), { recursive: true });
    writeFileSync(join(folder, name), text);
  }
  return folder;
}

const HEAD =
  '<!doctype html><html lang="en"><head><title>t</title><link rel="stylesheet" href="ui/ui.css" /><link rel="stylesheet" href="styles.css" /></head><body>';

test("an agent that built nothing scores as having built nothing", () => {
  assert.deepEqual(score(project({ "notes.txt": "I could not." }), contract), {
    built: false,
    usesCopy: false,
    findings: [],
    elements: [],
    unknown: [],
    notes: [],
  });
});

test("a sound page scores clean, and names the elements it used", () => {
  const folder = project({
    "index.html": `${HEAD}<main><o-wrap narrow><o-stack gap="4"><h1>Fees</h1><o-table><table><tbody><tr><th scope="row">Summer</th><td>3.20</td></tr></tbody></table></o-table></o-stack></o-wrap></main>`,
    "styles.css": ".total { font-weight: 600; color: var(--color-ink); }",
  });

  assert.deepEqual(score(folder, contract), {
    built: true,
    usesCopy: true,
    findings: [],
    elements: ["o-stack", "o-table", "o-wrap"],
    unknown: [],
    notes: [],
  });
});

test("faults in the page and in its styles are both found, each with its file", () => {
  const folder = project({
    "index.html": `${HEAD}<main><h1>Fees</h1><o-hero>Welcome</o-hero></main>`,
    "styles.css": ".a {\n  color: #333;\n}",
  });
  const { findings, unknown } = score(folder, contract);

  assert.deepEqual(
    findings.map(({ file, line, rule }) => [file, line, rule]),
    [
      ["index.html", 1, "unknown-element"],
      ["styles.css", 2, "raw-color"],
    ],
  );
  assert.deepEqual(unknown, ["o-hero"]);
});

test("the system linked from the web, not from the project's copy, is told apart", () => {
  const folder = project({
    "index.html":
      '<!doctype html><title>t</title><link rel="stylesheet" href="https://oinam.dev/ui/ui.css" /><main><h1>Hi</h1></main>',
  });
  assert.equal(score(folder, contract).usesCopy, false);
});

test("habits the linter lets pass are noted for the reader", () => {
  const cards = "<o-card><h2>One</h2></o-card>".repeat(3);
  const folder = project({
    "index.html": `${HEAD}<div><o-grid>${cards}</o-grid></div>`,
    "styles.css": "p { text-align: center; }\nh2 { text-align: center; }",
  });

  assert.deepEqual(score(folder, contract).notes, [
    "1 row(s) of three or more equal cards",
    "text-align: center, 2 time(s)",
    "no h1",
    "no main",
  ]);
});

test("the write-up has a row for each brief and counts the rules broken", () => {
  const result = (name, rules) => ({
    name,
    built: true,
    usesCopy: true,
    findings: rules.map((rule) => ({ file: "index.html", line: 1, rule, message: "m" })),
    elements: ["o-stack"],
    unknown: [],
    notes: [],
    seen: [{ width: 320, theme: "light", overflow: 12, errors: [] }],
    seconds: 90,
    said: "Built it.",
  });
  const text = report({
    label: "trial",
    version: "9.9.9",
    agent: "an-agent",
    results: [result("fees", ["raw-color", "raw-color"]), result("contact", ["emoji"])],
  });

  assert.match(text, /^# Eval run: trial$/m);
  assert.match(text, /^\| fees \| yes \| yes \| 2 \| 0 \| at 320 \| 0 \| 90s \|$/m);
  assert.match(text, /^\| contact \| yes \| yes \| 1 \|/m);
  assert.match(text, /- raw-color: 2\n- emoji: 1/);
});

test("the agent is told to read the guide, and is told nothing the guide should teach", () => {
  assert.match(INSTRUCTION, /Read ui\/guide\.md and follow it/);
  assert.doesNotMatch(INSTRUCTION, /lint|token|o-stack|card|color/i);
});

test("every brief says what the reader came for, and gives facts to build from", () => {
  const briefs = readdirSync(new URL("evals/briefs/", ROOT));

  assert.ok(briefs.length >= 5);
  for (const name of briefs) {
    const brief = readFileSync(new URL(`evals/briefs/${name}`, ROOT), "utf8");
    assert.match(brief, /^# \S/, name);
    assert.ok(brief.includes("## What the reader came for\n"), name);
    assert.ok(brief.includes("## The facts\n"), name);
    // A brief describes the page. It must not tell the agent how to design it.
    assert.doesNotMatch(brief, /<o-[a-z]+|Oinam UI|design system/i, name);
  }
});
