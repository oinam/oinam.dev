import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { answer, TOOLS } from "../public/ui/tools/mcp.js";

const UI = new URL("../public/ui/", import.meta.url);
const registry = JSON.parse(readFileSync(new URL("registry.json", UI), "utf8"));

const call = (name, args = {}) =>
  answer({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }).result;
const said = (result) => result.content[0].text;

test("it introduces itself, with the version of the system it serves", () => {
  const { result } = answer({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18" },
  });

  assert.equal(result.protocolVersion, "2025-06-18");
  assert.deepEqual(result.capabilities, { tools: {} });
  assert.equal(result.serverInfo.name, "oinam-ui");
  assert.equal(result.serverInfo.version, registry.version);
  assert.match(result.instructions, /call guide/);
});

test("a notification gets no answer", () => {
  assert.equal(answer({ jsonrpc: "2.0", method: "notifications/initialized" }), undefined);
});

test("it lists every tool, each with a description and a schema", () => {
  const { tools } = answer({ jsonrpc: "2.0", id: 1, method: "tools/list" }).result;

  assert.deepEqual(
    tools.map((tool) => tool.name),
    Object.keys(TOOLS),
  );
  for (const { name, description, inputSchema } of tools) {
    assert.ok(description.length > 40, `${name} should say what it is for`);
    assert.equal(inputSchema.type, "object", name);
  }
});

test("guide, tokens, and why return those files", () => {
  assert.ok(said(call("guide")).startsWith(`# Oinam UI v${registry.version}`));
  assert.match(said(call("tokens")), /--color-ink:/);
  assert.ok(said(call("why")).startsWith("# Why Oinam UI is the way it is"));
});

test("it lists every component, and returns the page of any one of them", () => {
  const list = said(call("list_components"));

  for (const { name, title } of registry.components) {
    assert.match(list, new RegExp(`^${name}  `, "m"));
    assert.ok(said(call("component", { name })).startsWith(`# ${title}\n`), name);
  }
});

test("it lists every pattern, and returns the source of any one of them", () => {
  const list = said(call("list_patterns"));

  for (const { name, title } of registry.patterns.pages) {
    assert.match(list, new RegExp(`^${name}  `, "m"));
    assert.match(said(call("pattern", { name })), new RegExp(`Pattern: ${title}`));
  }
});

test("asked for something that is not there, it says what there is", () => {
  const result = call("component", { name: "hero" });

  assert.equal(result.isError, true);
  assert.match(said(result), /no component called "hero"\. There are: wrap, stack/);
});

test("lint checks markup and styles, and says where each fault is", () => {
  const result = call("lint", {
    html: "<p>Fine</p>\n<onm-hero></onm-hero>",
    css: ".a { color: #333; }",
  });

  assert.match(said(result), /^2 to mend:/);
  assert.match(said(result), /html line 2 {2}unknown-element/);
  assert.match(said(result), /css line 1 {2}raw-color/);
});

test("lint says so when there is nothing to mend, and when it was given nothing", () => {
  assert.equal(
    said(call("lint", { html: '<onm-stack gap="2"><p>Hi</p></onm-stack>' })),
    "Clean. Nothing to mend.",
  );
  assert.equal(call("lint").isError, true);
});

test("an unknown tool or method is refused, as the protocol says", () => {
  assert.equal(
    answer({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "nope" } }).error.code,
    -32602,
  );
  assert.equal(answer({ jsonrpc: "2.0", id: 1, method: "resources/list" }).error.code, -32601);
});

test("run as a program, it answers line for line and shrugs off what is not JSON", async () => {
  const child = spawn("node", [fileURLToPath(new URL("tools/mcp.js", UI))]);
  let out = "";
  child.stdout.on("data", (chunk) => (out += chunk));

  child.stdin.write('{"jsonrpc":"2.0","id":1,"method":"ping"}\n');
  child.stdin.write("this is not json\n");
  child.stdin.write(
    '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_patterns"}}\n',
  );
  child.stdin.end();
  await new Promise((done) => child.on("close", done));

  const replies = out
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.deepEqual(replies[0], { jsonrpc: "2.0", id: 1, result: {} });
  assert.equal(replies[1].error.code, -32700);
  assert.equal(replies[2].id, 2);
  assert.match(replies[2].result.content[0].text, /^form {2}A form\./);
});

test("the skill names itself, says when to use it, and points only at files that exist", () => {
  const skill = readFileSync(new URL("skill/SKILL.md", UI), "utf8");
  const [, front] = skill.match(/^---\n([\s\S]*?)\n---\n/);

  assert.match(front, /^name: oinam-ui$/m);
  assert.match(front, /^description: .{80,}$/m);
  assert.equal(registry.skill, "skill/SKILL.md");

  const named = [...skill.matchAll(/\bui\/([a-z/.-]+\.(?:md|js|json|html))\b/g)].map(
    ([, path]) => path,
  );
  assert.ok(named.length >= 5);
  for (const path of named) assert.ok(existsSync(new URL(path, UI)), `ui/${path}`);
});
