/*
 * install.sh is run for real here: against a copy of the system served from
 * this machine, into a folder made for the test.
 */

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const UI = fileURLToPath(new URL("../public/ui/", import.meta.url));
const SCRIPT = join(UI, "install.sh");

/** A folder standing in for oinam.dev, and one standing in for a project. */
let remote, project, server, url;

/** Every file under a folder, as paths relative to it. */
const tree = (folder) =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)))
    .sort();

/** Run the installer in the project folder. Resolves with what it printed. */
const install = (...args) =>
  new Promise((resolve, reject) => {
    const options = { cwd: project, env: { ...process.env, OINAM_UI_URL: url } };
    execFile("sh", [SCRIPT, ...args], options, (error, stdout, stderr) =>
      error ? reject(new Error(stderr || error.message)) : resolve(stdout),
    );
  });

/** Publish a fresh copy of the system on the stand-in site, undoing earlier releases. */
function publish() {
  cpSync(UI, remote, { recursive: true });
}

/** Release a new version on the stand-in site, with a change to some of its files. */
function release(version, ...changed) {
  const registry = join(remote, "registry.json");
  writeFileSync(
    registry,
    readFileSync(registry, "utf8").replace(/"version": "[^"]+"/, `"version": "${version}"`),
  );
  for (const name of changed) appendFileSync(join(remote, name), `\n/* New in ${version}. */\n`);
}

before(async () => {
  remote = mkdtempSync(join(tmpdir(), "oinam-ui-remote-"));
  publish();

  server = createServer((request, response) => {
    try {
      response.end(readFileSync(join(remote, new URL(request.url, "http://x").pathname)));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  rmSync(remote, { recursive: true, force: true });
});

test.beforeEach(() => {
  publish();
  project = mkdtempSync(join(tmpdir(), "oinam-ui-project-"));
});

test.afterEach(() => {
  rmSync(project, { recursive: true, force: true });
});

test("it takes every stylesheet and script of the system, with its documents and data", async () => {
  await install();

  const taken = tree(join(project, "ui"));
  // The released versions are served for linking, and are not part of a copy.
  const system = tree(UI).filter(
    (name) => /\.(css|js|woff2)$/.test(name) && !name.startsWith("releases/"),
  );

  assert.deepEqual(
    system.filter((name) => !taken.includes(name)),
    [],
  );
  for (const name of [
    "guide.md",
    "why.md",
    "CHANGELOG.md",
    "tokens.json",
    "contract.json",
    "registry.json",
    "tools/lint.js",
    "tools/see.js",
    "tools/mcp.js",
    "skill/SKILL.md",
    "components/button.md",
    "patterns/form.html",
    "patterns/patterns.css",
  ]) {
    assert.ok(taken.includes(name), name);
  }
});

test("it leaves the site's own page behind", async () => {
  await install();
  assert.ok(!existsSync(join(project, "ui", "index.html")));
});

test("the files arrive unchanged", async () => {
  await install();

  for (const name of ["ui.css", "tokens.css", "tabs.js", "guide.md"]) {
    assert.equal(
      readFileSync(join(project, "ui", name), "utf8"),
      readFileSync(join(UI, name), "utf8"),
      name,
    );
  }
});

test("it installs into the folder it is given", async () => {
  await install("public/vendor/oinam");
  assert.ok(existsSync(join(project, "public/vendor/oinam/ui.css")));
});

test("nothing it installs points back at oinam.dev to load anything", async () => {
  await install();

  const folder = join(project, "ui");
  // The tools run in Node, on the project's machine. A page never loads them.
  const loaded = tree(folder).filter(
    (name) => /\.(css|js)$/.test(name) && !name.startsWith("tools/"),
  );
  for (const name of loaded) {
    const code = readFileSync(join(folder, name), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /https?:\/\//, `${name} names another site outside a comment`);
  }
});

test("it says so and stops when a file cannot be had", async () => {
  url += "/nowhere";
  await assert.rejects(install(), /Could not download/);
  url = url.replace("/nowhere", "");
});

/* Upgrading */

const mine = (name) => join(project, "ui", name);
const theirs = (name) => readFileSync(join(remote, name), "utf8");

test("run again with nothing new, it changes nothing and says so", async () => {
  await install();
  const said = await install();

  assert.match(said, /already up to date/);
});

test("an upgrade replaces the files the project has not touched", async () => {
  await install();
  release("9.0.0", "button.css");

  const said = await install();

  assert.equal(readFileSync(mine("button.css"), "utf8"), theirs("button.css"));
  assert.match(said, /went from \d+\.\d+\.\d+ to 9\.0\.0/);
  assert.match(said, /CHANGELOG\.md/);
});

test("an upgrade never overwrites a file the project has changed", async () => {
  await install();
  appendFileSync(mine("card.css"), "\n/* Ours. */\n");
  const ours = readFileSync(mine("card.css"), "utf8");
  release("9.0.0", "card.css");

  const said = await install();

  assert.equal(readFileSync(mine("card.css"), "utf8"), ours);
  assert.equal(readFileSync(mine("card.css.new"), "utf8"), theirs("card.css"));
  assert.match(said, /Kept as they are/);
  assert.match(said, /ui\/card\.css\.new/);
});

test("a changed file is still kept on the upgrade after that", async () => {
  await install();
  appendFileSync(mine("card.css"), "\n/* Ours. */\n");
  const ours = readFileSync(mine("card.css"), "utf8");
  release("9.0.0", "card.css");
  await install();
  release("9.1.0", "card.css");

  await install();

  assert.equal(readFileSync(mine("card.css"), "utf8"), ours);
  assert.equal(readFileSync(mine("card.css.new"), "utf8"), theirs("card.css"));
});

test("a change the project made that the system has not is left in peace", async () => {
  await install();
  appendFileSync(mine("card.css"), "\n/* Ours. */\n");
  release("9.0.0", "button.css");

  const said = await install();

  // card.css is the same in both versions, so there is nothing to merge.
  assert.doesNotMatch(said, /card\.css/);
  assert.ok(!existsSync(mine("card.css.new")));
  assert.equal(readFileSync(mine("button.css"), "utf8"), theirs("button.css"));
});

test("a merge still owed is still asked for on the next run", async () => {
  await install();
  appendFileSync(mine("card.css"), "\n/* Ours. */\n");
  release("9.0.0", "card.css");
  await install();

  const said = await install();

  assert.ok(existsSync(mine("card.css.new")));
  assert.match(said, /ui\/card\.css\.new/);
});

test("it names the files the system has dropped, and does not delete them", async () => {
  await install();
  const registry = join(remote, "registry.json");
  writeFileSync(registry, readFileSync(registry, "utf8").replaceAll('"badge.css"', '"alert.css"'));

  const said = await install();

  assert.match(said, /No longer part of the system/);
  assert.match(said, /ui\/badge\.css/);
  assert.ok(existsSync(mine("badge.css")));
});

test("a download that fails part way leaves the project as it was", async () => {
  await install();
  release("9.0.0", "button.css");
  rmSync(join(remote, "tabs.js"));
  const had = readFileSync(mine("button.css"), "utf8");

  await assert.rejects(install(), /Nothing in ui\/ was changed/);

  assert.equal(readFileSync(mine("button.css"), "utf8"), had);
});
