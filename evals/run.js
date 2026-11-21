#!/usr/bin/env node
/*
 * The evals: does the guide get an agent to build a good page?
 *
 *   node evals/run.js                          every brief, with the default agent
 *   node evals/run.js fees contact             only these briefs
 *   node evals/run.js --agent "codex exec"     another agent
 *   node evals/run.js --label after-split      a name for this run, to compare with others
 *
 * For each brief in evals/briefs/, this makes an empty project with a copy of
 * the system in ui/, as install.sh would leave it, and asks an agent to build
 * the page. The agent gets the brief and one instruction: read ui/guide.md and
 * follow it. Then the page is scored by the linter, photographed by see.js,
 * and the lot is written up in evals/runs/<label>/results.md.
 *
 * What a program can score is in the table. Whether the page looks made is
 * for a person: open the pictures.
 *
 * Running this spends the agent's tokens, so it is not part of "check".
 */

import { spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { findBrowser, see, serve } from "../public/ui/tools/see.js";
import { score } from "./score.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const UI = resolve(HERE, "../public/ui");

/** The one instruction every agent gets. The brief is beside it, in brief.md. */
export const INSTRUCTION = `This project is designed with the Oinam UI design system, which is in the ui/ folder. Read ui/guide.md and follow it.

Then build the page described in brief.md. Write it to index.html in this folder. If the page needs styles of its own, put them in styles.css. Do not change anything in ui/.

When you are done, reply with one short paragraph: what you built, and anything you were unsure of.`;

/** The agent run when none is named: Claude Code, headless, allowed to read, write, and run the tools. */
const AGENT =
  'claude -p --permission-mode acceptEdits --setting-sources project --allowedTools Read Write Edit Glob Grep "Bash(node ui/tools/*)" "Bash(ls *)"';

/* How long one agent may take on one brief, in milliseconds. */
const PATIENCE = 15 * 60 * 1000;

/** Run a shell command with the instruction on its standard input. Resolves with what it said. */
function ask(command, cwd) {
  return new Promise((done) => {
    const started = Date.now();
    const child = spawn(command, { cwd, shell: true, stdio: ["pipe", "pipe", "pipe"] });
    let said = "";
    let complained = "";
    child.stdout.on("data", (chunk) => (said += chunk));
    child.stderr.on("data", (chunk) => (complained += chunk));
    const timer = setTimeout(() => child.kill(), PATIENCE);
    child.on("close", (code) => {
      clearTimeout(timer);
      done({
        code,
        said: said.trim(),
        complained: complained.trim(),
        seconds: Math.round((Date.now() - started) / 1000),
      });
    });
    child.stdin.end(INSTRUCTION);
  });
}

/** Make the project an agent starts from: the brief, and the system as install.sh would leave it. */
function prepare(folder, brief) {
  rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });
  cpSync(UI, join(folder, "ui"), {
    recursive: true,
    // The site's own page and the installer are not part of what a project gets.
    filter: (source) =>
      !["index.html", "install.sh"].includes(basename(source)) || source.includes("/patterns/"),
  });
  cpSync(brief, join(folder, "brief.md"));
}

async function main(args) {
  const option = (name, fallback) => {
    const at = args.indexOf(`--${name}`);
    return at === -1 ? fallback : args.splice(at, 2)[1];
  };
  const agent = option("agent", AGENT);
  const label = option("label", new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-"));
  const only = args;

  const briefs = readdirSync(join(HERE, "briefs"))
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .filter((name) => only.length === 0 || only.includes(name));
  if (briefs.length === 0) {
    console.error("No such brief. There are: " + readdirSync(join(HERE, "briefs")).join(", "));
    return 2;
  }

  const run = join(HERE, "runs", label);
  const contract = JSON.parse(readFileSync(join(UI, "contract.json"), "utf8"));
  const version = JSON.parse(readFileSync(join(UI, "registry.json"), "utf8")).version;
  const browser = findBrowser();
  console.log(`Run "${label}": ${briefs.length} brief(s), Oinam UI ${version}\nAgent: ${agent}\n`);

  // The agents work at the same time; each has a folder of its own.
  const results = await Promise.all(
    briefs.map(async (name) => {
      const folder = join(run, name);
      prepare(folder, join(HERE, "briefs", `${name}.md`));
      const answer = await ask(agent, folder);
      writeFileSync(
        join(folder, "agent.txt"),
        `${answer.said}\n${answer.complained ? `\n[stderr]\n${answer.complained}\n` : ""}`,
      );

      const scored = score(folder, contract);
      let seen = [];
      if (scored.built && browser) {
        const server = await serve(folder);
        try {
          seen = await see(`${server.url}/index.html`, { out: join(folder, "seen") });
        } catch (error) {
          scored.notes.push(`could not be photographed: ${error.message}`);
        } finally {
          server.close();
        }
      }
      console.log(
        `${name}: ${scored.built ? `${scored.findings.length} finding(s)` : "nothing built"}, ${answer.seconds}s`,
      );
      return { name, ...answer, ...scored, seen };
    }),
  );

  writeFileSync(
    join(run, "results.json"),
    JSON.stringify({ label, version, agent, results }, null, 2),
  );
  writeFileSync(join(run, "results.md"), report({ label, version, agent, results }));
  console.log(
    `\nWritten up in ${join("evals/runs", label, "results.md")}. The pictures are beside each page, in seen/.`,
  );
  return 0;
}

/** The results as a page a person can read. */
export function report({ label, version, agent, results }) {
  const yes = (value) => (value ? "yes" : "no");
  const rows = results.map((result) => {
    const overflow = result.seen.filter((one) => one.overflow > 0).map((one) => one.width);
    const errors = result.seen.reduce((sum, one) => sum + one.errors.length, 0);
    return `| ${result.name} | ${yes(result.built)} | ${yes(result.usesCopy)} | ${result.findings.length} | ${result.unknown.length} | ${
      result.seen.length === 0
        ? "not seen"
        : overflow.length
          ? `at ${[...new Set(overflow)].join(", ")}`
          : "no"
    } | ${errors} | ${result.seconds}s |`;
  });

  const rules = {};
  for (const { findings } of results)
    for (const { rule } of findings) rules[rule] = (rules[rule] ?? 0) + 1;
  const broken = Object.entries(rules).sort((a, b) => b[1] - a[1]);

  const details = results.map((result) => {
    const lines = [`### ${result.name}`, ""];
    lines.push(
      `Elements used: ${result.elements.length ? result.elements.map((one) => `\`${one}\``).join(", ") : "none"}.`,
    );
    if (result.unknown.length)
      lines.push(`Elements it made up: ${result.unknown.map((one) => `\`${one}\``).join(", ")}.`);
    if (result.notes.length) lines.push(`Notes: ${result.notes.join("; ")}.`);
    if (result.findings.length) {
      lines.push("", "Findings:", "");
      for (const { file, line, rule, message } of result.findings)
        lines.push(`- \`${file}:${line}\` ${rule}: ${message}`);
    }
    if (result.said)
      lines.push("", "What the agent said:", "", `> ${result.said.replace(/\n+/g, "\n> ")}`);
    return lines.join("\n");
  });

  return `# Eval run: ${label}

Oinam UI ${version}. Agent: \`${agent}\`.

Each agent was given a brief and one instruction: read \`ui/guide.md\` and follow it.

| Brief | Built | Uses its copy | Lint findings | Made-up elements | Runs off the side | Page errors | Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Rules broken, most often first

${broken.length ? broken.map(([rule, count]) => `- ${rule}: ${count}`).join("\n") : "None."}

## Each page

${details.join("\n\n")}

## What this does not say

Whether the pages look made. Open \`seen/\` beside each page and look.
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!existsSync(UI)) throw new Error("Run this from the repository.");
  process.exitCode = await main(process.argv.slice(2));
}
