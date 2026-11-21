/*
 * install.sh is run for real here: against a copy of the system served from
 * this machine, into a folder made for the test.
 */

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
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

before(async () => {
  remote = mkdtempSync(join(tmpdir(), "oinam-ui-remote-"));
  cpSync(UI, remote, { recursive: true });

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
  project = mkdtempSync(join(tmpdir(), "oinam-ui-project-"));
});

test.afterEach(() => {
  rmSync(project, { recursive: true, force: true });
});

test("it takes every stylesheet and script of the system, and the guide", async () => {
  await install();

  const taken = tree(join(project, "ui"));
  const system = tree(UI).filter((name) => /\.(css|js|woff2)$/.test(name));

  assert.deepEqual(
    system.filter((name) => !taken.includes(name)),
    [],
  );
  assert.ok(taken.includes("guide.md"));
  assert.ok(taken.includes("registry.json"));
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
  for (const name of tree(folder).filter((name) => /\.(css|js)$/.test(name))) {
    const code = readFileSync(join(folder, name), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /https?:\/\//, `${name} names another site outside a comment`);
  }
});

test("it says so and stops when a file cannot be had", async () => {
  url += "/nowhere";
  await assert.rejects(install(), /Could not download/);
  url = url.replace("/nowhere", "");
});
