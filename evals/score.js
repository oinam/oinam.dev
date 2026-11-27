/*
 * Score one page an agent built, by what a program can tell.
 *
 * There is no single number here on purpose. A page is scored on separate
 * questions, each with a plain answer, and the pictures are kept for a person
 * to judge what a program cannot: whether it looks made.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { lintCss, lintHtml, parse } from "../public/ui/tools/lint.js";

/**
 * @typedef {object} Score
 * @property {boolean} built There is an index.html.
 * @property {boolean} usesCopy It links the project's own copy of the system.
 * @property {{ rule: string, file: string, line: number, message: string }[]} findings What the linter reports.
 * @property {string[]} elements The custom elements of the system the page uses.
 * @property {string[]} unknown Elements named like the system's that it does not have.
 * @property {string[]} notes Habits the guide warns of that the linter does not catch.
 */

/**
 * @param {string} folder Where the agent worked: index.html, perhaps styles, and ui/.
 * @param {object} contract The contents of contract.json.
 * @returns {Score}
 */
export function score(folder, contract) {
  const page = join(folder, "index.html");
  if (!existsSync(page)) {
    return { built: false, usesCopy: false, findings: [], elements: [], unknown: [], notes: [] };
  }

  const html = readFileSync(page, "utf8");
  const { nodes } = parse(html);
  const sheets = readdirSync(folder).filter((name) => name.endsWith(".css"));
  const css = sheets.map((name) => readFileSync(join(folder, name), "utf8")).join("\n");

  const findings = [
    ...lintHtml(html, contract).map((finding) => ({ file: "index.html", ...finding })),
    ...sheets.flatMap((name) =>
      lintCss(readFileSync(join(folder, name), "utf8")).map((finding) => ({
        file: name,
        ...finding,
      })),
    ),
  ];

  const custom = [
    ...new Set(nodes.map((node) => node.tag).filter((tag) => tag.startsWith("onm-"))),
  ];
  const usesCopy = nodes.some(
    (node) =>
      node.tag === "link" &&
      /(^|\/)ui\/ui\.css$/.test(node.attrs.href ?? "") &&
      !/^https?:/.test(node.attrs.href),
  );

  /* Habits a person would notice. These are notes for the reader of the results, not faults. */
  const notes = [];
  const cardRows = nodes.filter(
    (node) =>
      node.tag === "onm-grid" &&
      node.children.filter((child) => child.tag === "onm-card").length >= 3,
  );
  if (cardRows.length > 0) notes.push(`${cardRows.length} row(s) of three or more equal cards`);
  const centered = (css.match(/text-align:\s*center/g) ?? []).length;
  if (centered > 0) notes.push(`text-align: center, ${centered} time(s)`);
  const badges = nodes.filter((node) => node.tag === "onm-badge").length;
  if (badges > 4) notes.push(`${badges} badges`);
  if (!nodes.some((node) => node.tag === "h1")) notes.push("no h1");
  if (!nodes.some((node) => node.tag === "main")) notes.push("no main");
  const own = css.split("\n").filter((line) => line.trim()).length;
  if (own > 150) notes.push(`${own} lines of its own CSS`);

  return {
    built: true,
    usesCopy,
    findings,
    elements: custom.filter((tag) => tag in contract.elements).sort(),
    unknown: custom.filter((tag) => !(tag in contract.elements)).sort(),
    notes,
  };
}
