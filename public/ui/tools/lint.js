#!/usr/bin/env node
/*
 * Oinam UI: the linter.
 *
 *   node ui/tools/lint.js page.html styles.css
 *   node ui/tools/lint.js site/            every .html and .css file under a folder
 *   node ui/tools/lint.js --json site/     the findings as JSON
 *   node ui/tools/lint.js --rules          every rule, and what it is for
 *
 * It checks a page against the rules in guide.md that a program can check:
 * that every element, attribute, and value is one the system has, that every
 * control has a name, that no color is written out raw, and that the page
 * avoids the habits the guide warns against. It exits with 1 if it finds
 * anything, so it can gate a commit.
 *
 * If you are an agent: run this on what you wrote before you hand it back,
 * and mend what it reports. It reads a page as text and never runs it, so a
 * clean result does not mean the page looks right. Look at it too; see.js
 * takes the pictures.
 *
 * A rule that is wrong for one line can be set aside there, with a reason:
 *
 *   <!-- lint-allow two-solid-buttons: both are equal choices here -->
 *   (in CSS)  lint-allow gradient: this draws the arrow of a select
 *
 * The comment covers the line it is on and the line after it.
 *
 * It needs Node 20 or later and nothing else. What the system accepts is read
 * from contract.json, beside this folder.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Every rule, and the reason for it, in a sentence. */
export const RULES = {
  "unknown-element": "An o- element that Oinam UI does not have.",
  "unknown-attribute": "An attribute an o- element does not take.",
  "unknown-value": "A value an attribute does not take.",
  "wrong-element": "A class of the system on an element it is not for.",
  "missing-part": "An element without something it must contain.",
  "nested-card": "A card inside a card. One surface deep.",
  "inline-style": "A style attribute. Use a class and the page's own stylesheet.",
  "inline-script":
    "Script written into the page, or a handler in an attribute. Put it in a file and link it.",
  "raw-color": "A color written out. Use a token, such as var(--color-ink).",
  "raw-font": "A font written out. Use var(--font-body), var(--font-heading), or var(--font-mono).",
  gradient: "A gradient. The system has two flat colors.",
  capitals: "Text forced into capitals. Labels are written like sentences.",
  important: "!important. Page styles already win over the system's.",
  "two-solid-buttons":
    "Two solid buttons side by side. One main action; the rest outline or ghost.",
  "unnamed-control": "A form control with no label.",
  "unnamed-button": "A button or link with nothing to call it.",
  "missing-alt": 'An image with no alt attribute. Use alt="" if it is decoration.',
  "heading-order": "More than one h1, or a heading level skipped.",
  "duplicate-id": "An id used twice.",
  "broken-reference": "An attribute that points at an id the page does not have.",
  emoji: "An emoji. Plain text.",
  "linked-not-copied": "The system loaded from oinam.dev. Take a copy with install.sh.",
};

/** @typedef {{ rule: string, line: number, message: string }} Finding */

const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));
const RAW = new Set(["script", "style"]);

/**
 * @typedef {object} Node
 * @property {string} tag
 * @property {Record<string, string>} attrs
 * @property {number} line
 * @property {Node | null} parent
 * @property {Node[]} children
 * @property {string} text The text directly inside it, not inside its children.
 */

/**
 * Read HTML into a tree. It is forgiving, as a browser is: it does not check
 * that the markup is valid, only finds the elements, their attributes, and the
 * line each starts on.
 *
 * @param {string} html
 * @returns {{ root: Node, nodes: Node[], comments: { line: number, text: string }[] }}
 */
export function parse(html) {
  const root = { tag: "#root", attrs: {}, line: 1, parent: null, children: [], text: "" };
  const nodes = [];
  const comments = [];
  const lineAt = (() => {
    const starts = [0];
    for (let at = html.indexOf("\n"); at !== -1; at = html.indexOf("\n", at + 1))
      starts.push(at + 1);
    return (offset) => {
      let low = 0;
      let high = starts.length - 1;
      while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (starts[middle] <= offset) low = middle;
        else high = middle - 1;
      }
      return low + 1;
    };
  })();

  const token =
    /<!--([\s\S]*?)-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>]+))?)*)\s*(\/?)>/gi;
  const attribute = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+)))?/g;

  let open = root;
  let last = 0;
  let match;
  while ((match = token.exec(html))) {
    open.text += html.slice(last, match.index);
    last = token.lastIndex;
    const [, comment, closing, tag, attributes, selfClosed] = match;

    if (comment !== undefined) {
      comments.push({ line: lineAt(match.index), text: comment.trim() });
    } else if (closing) {
      const name = closing.toLowerCase();
      for (let node = open; node !== root; node = node.parent) {
        if (node.tag === name) {
          open = node.parent;
          break;
        }
      }
    } else if (tag) {
      const name = tag.toLowerCase();
      const attrs = {};
      for (const [, key, double, single, bare] of attributes.matchAll(attribute)) {
        attrs[key.toLowerCase()] = double ?? single ?? bare ?? "";
      }
      const node = {
        tag: name,
        attrs,
        line: lineAt(match.index),
        parent: open,
        children: [],
        text: "",
      };
      open.children.push(node);
      nodes.push(node);

      if (RAW.has(name)) {
        // What is inside a script or a style is not markup. Take it whole.
        const end = html.toLowerCase().indexOf(`</${name}`, last);
        node.text = html.slice(last, end === -1 ? html.length : end);
        token.lastIndex = last = end === -1 ? html.length : end;
      } else if (!VOID.has(name) && !selfClosed) {
        open = node;
      }
    }
  }
  open.text += html.slice(last);
  return { root, nodes, comments };
}

/* Small helpers over the tree. */

const classes = (node) => (node.attrs.class ?? "").split(/\s+/).filter(Boolean);
const within = (node, test) => {
  for (let up = node.parent; up; up = up.parent) if (test(up)) return up;
  return null;
};
const descendants = (node) => node.children.flatMap((child) => [child, ...descendants(child)]);
const allText = (node) =>
  RAW.has(node.tag) ? "" : node.text + node.children.map(allText).join(" ");
const named = (node) =>
  Boolean(
    node.attrs["aria-label"]?.trim() || node.attrs["aria-labelledby"] || node.attrs.title?.trim(),
  );

/** Does a node match one of the contract's simple tests: "table", ".button", "[popover]"? */
function matches(node, test) {
  if (test.startsWith(".")) return classes(node).includes(test.slice(1));
  if (test.startsWith("[")) {
    const [key, value] = test.slice(1, -1).split("=");
    return key in node.attrs && (value === undefined || node.attrs[key] === value);
  }
  return node.tag === test;
}

const EMOJI = /\p{Extended_Pictographic}/u;
/* Signs that are type, not pictures, though Unicode files them with the pictures. */
const NOT_EMOJI = /[©®™←-⇿⌀-⏿①-⓿■-◿]/gu;

/**
 * Check a page.
 *
 * @param {string} html
 * @param {object} contract The contents of contract.json.
 * @returns {Finding[]}
 */
export function lintHtml(html, contract) {
  const { nodes, comments } = parse(html);
  /** @type {Finding[]} */
  const findings = [];
  const report = (rule, node, message) => findings.push({ rule, line: node.line, message });

  const ids = new Map();
  for (const node of nodes) {
    if (!node.attrs.id) continue;
    if (ids.has(node.attrs.id))
      report(
        "duplicate-id",
        node,
        `id="${node.attrs.id}" is also on line ${ids.get(node.attrs.id).line}.`,
      );
    else ids.set(node.attrs.id, node);
  }

  const global = new Set(contract.global);
  let headings = [];

  for (const node of nodes) {
    const { tag, attrs } = node;
    const show = `<${tag}>`;

    if ("style" in attrs) report("inline-style", node, `${show} has a style attribute.`);
    // Data in a script element, such as JSON, is not code, and neither is an import map.
    if (
      tag === "script" &&
      !("src" in attrs) &&
      !/json|importmap/.test(attrs.type ?? "") &&
      node.text.trim()
    ) {
      report(
        "inline-script",
        node,
        "<script> has code written into the page. Put it in a file and link it with src.",
      );
    }
    const handler = Object.keys(attrs).find((key) => /^on[a-z]+$/.test(key));
    if (handler)
      report(
        "inline-script",
        node,
        `${show} has a handler in its ${handler} attribute. Listen for the event from a script file.`,
      );

    /* Custom elements: is it one of ours, and does it take what it was given? */
    if (tag.startsWith("o-")) {
      const entry = contract.elements[tag];
      if (!entry) {
        report("unknown-element", node, `${show} is not an element of Oinam UI.`);
      } else {
        for (const [key, value] of Object.entries(attrs)) {
          if (
            global.has(key) ||
            key === "style" ||
            key.startsWith("aria-") ||
            key.startsWith("data-")
          )
            continue;
          const takes = entry.attributes[key];
          if (takes === undefined) {
            const has = Object.keys(entry.attributes);
            report(
              "unknown-attribute",
              node,
              `${show} does not take "${key}". ${has.length ? `It takes: ${has.join(", ")}.` : "It takes no attributes of its own."}`,
            );
          } else if (Array.isArray(takes) && !takes.includes(value)) {
            report(
              "unknown-value",
              node,
              `${show} ${key}="${value}" is not a value it takes. Use one of: ${takes.join(", ")}.`,
            );
          }
        }
        for (const part of entry.contains ?? []) {
          if (!descendants(node).some((inner) => matches(inner, part))) {
            report(
              "missing-part",
              node,
              `${show} must contain ${part.startsWith(".") ? `an element with class="${part.slice(1)}"` : part.startsWith("[") ? `an element with ${part}` : `a <${part}>`}.`,
            );
          }
        }
        for (const outer of entry.not_inside ?? []) {
          if (within(node, (up) => up.tag === outer)) {
            report(
              tag === "o-card" ? "nested-card" : "missing-part",
              node,
              `${show} is inside another <${outer}>.`,
            );
          }
        }
      }
    }

    /* Classes of the system: on the right element, with values it knows? */
    for (const name of classes(node)) {
      const entry = contract.classes[name];
      if (!entry) continue;
      if (!entry.on.includes("*") && !entry.on.includes(tag)) {
        report(
          "wrong-element",
          node,
          `class="${name}" goes on ${entry.on.map((one) => `<${one}>`).join(" or ")}, not on ${show}.`,
        );
      }
      for (const [key, takes] of Object.entries(entry.attributes)) {
        if (key in attrs && Array.isArray(takes) && !takes.includes(attrs[key])) {
          report(
            "unknown-value",
            node,
            `${show} class="${name}" ${key}="${attrs[key]}" is not a value it takes. Use one of: ${takes.join(", ")}.`,
          );
        }
      }
    }

    /* Names: every control, button, and picture has one. */
    if (
      ["input", "select", "textarea"].includes(tag) &&
      !["hidden", "submit", "reset", "button", "image"].includes(attrs.type)
    ) {
      const labelled =
        named(node) ||
        within(node, (up) => up.tag === "label") ||
        (attrs.id && nodes.some((other) => other.tag === "label" && other.attrs.for === attrs.id));
      if (!labelled)
        report(
          "unnamed-control",
          node,
          `${show} has no label. Give it a <label for>, wrap it in a <label>, or add aria-label.`,
        );
    }
    if ((tag === "button" || (tag === "a" && "href" in attrs)) && !named(node)) {
      const said =
        allText(node).trim() ||
        descendants(node).some(
          (inner) =>
            inner.attrs.alt?.trim() ||
            (inner.tag === "svg" && named(inner)) ||
            (inner.tag === "title" && inner.text.trim()),
        );
      if (!said)
        report("unnamed-button", node, `${show} has no text. Give it words, or an aria-label.`);
    }
    if (tag === "img" && !("alt" in attrs))
      report("missing-alt", node, `<img> has no alt attribute.`);

    /* One main action in a group. */
    if (
      classes(node).includes("button") &&
      !attrs["data-variant"] &&
      !("disabled" in attrs) &&
      attrs["aria-disabled"] !== "true"
    ) {
      const solid = node.parent.children.filter(
        (other) =>
          classes(other).includes("button") &&
          !other.attrs["data-variant"] &&
          !("disabled" in other.attrs) &&
          other.attrs["aria-disabled"] !== "true",
      );
      if (solid.length > 1 && solid[1] === node) {
        report(
          "two-solid-buttons",
          node,
          `${solid.length} solid buttons sit side by side. Keep one for the main action and give the rest data-variant="outline" or "ghost".`,
        );
      }
    }

    /* Things that point at ids. */
    for (const key of [
      "for",
      "popovertarget",
      "commandfor",
      "aria-labelledby",
      "aria-describedby",
      "aria-controls",
      "list",
    ]) {
      if (!(key in attrs) || (key === "for" && tag !== "label")) continue;
      for (const id of attrs[key].split(/\s+/).filter(Boolean)) {
        if (!ids.has(id))
          report(
            "broken-reference",
            node,
            `${show} ${key}="${id}" points at an id the page does not have.`,
          );
      }
    }
    if (
      tag === "a" &&
      /^#./.test(attrs.href ?? "") &&
      !ids.has(decodeURIComponent(attrs.href.slice(1)))
    ) {
      report(
        "broken-reference",
        node,
        `<a href="${attrs.href}"> points at an id the page does not have.`,
      );
    }

    if (
      /^h[1-6]$/.test(tag) &&
      !within(node, (up) => up.tag === "dialog" || "popover" in up.attrs || up.tag === "template")
    ) {
      headings.push(node);
    }

    const loads =
      tag === "script" ? attrs.src : tag === "link" && attrs.rel === "stylesheet" ? attrs.href : "";
    if (/^https?:\/\/oinam\.dev\/ui\//.test(loads ?? "")) {
      report(
        "linked-not-copied",
        node,
        `${show} loads the system from oinam.dev. Take a copy with install.sh, and link that.`,
      );
    }

    const words = `${RAW.has(tag) ? "" : node.text} ${attrs.alt ?? ""} ${attrs["aria-label"] ?? ""} ${attrs.title ?? ""} ${attrs.placeholder ?? ""}`;
    if (EMOJI.test(words.replace(NOT_EMOJI, "")))
      report("emoji", node, `${show} has an emoji in it.`);

    if (tag === "style") {
      for (const finding of lintCss(node.text))
        findings.push({ ...finding, line: finding.line + node.line - 1 });
    }
  }

  const firsts = headings.filter((node) => node.tag === "h1");
  for (const extra of firsts.slice(1))
    report(
      "heading-order",
      extra,
      `A second <h1>. A page has one; the first is on line ${firsts[0].line}.`,
    );
  headings.reduce((level, node) => {
    const now = Number(node.tag[1]);
    if (level && now > level + 1)
      report("heading-order", node, `<${node.tag}> follows an <h${level}>. Do not skip a level.`);
    return now;
  }, 0);

  return allowed(findings, comments).sort((a, b) => a.line - b.line);
}

/**
 * Check a stylesheet.
 *
 * @param {string} css
 * @returns {Finding[]}
 */
export function lintCss(css) {
  /** @type {Finding[]} */
  const findings = [];
  const comments = [];
  // Blank the comments out, keeping the line breaks, so line numbers hold.
  const code = css.replace(/\/\*([\s\S]*?)\*\//g, (whole, text, offset) => {
    comments.push({ line: css.slice(0, offset).split("\n").length, text: text.trim() });
    return whole.replace(/[^\n]/g, " ");
  });

  // Inside @font-face a font is being named, not used. Blank those blocks out the same way.
  const rules = code.replace(/@font-face\s*\{[^}]*\}/g, (whole) => whole.replace(/[^\n]/g, " "));

  const declaration = /(^|[;{}])\s*([a-zA-Z-]+)\s*:\s*([^;{}]+)/g;
  for (const match of rules.matchAll(declaration)) {
    const [, , property, value] = match;
    const line = rules.slice(0, match.index + match[0].indexOf(property)).split("\n").length;
    const report = (rule, message) => findings.push({ rule, line, message });
    const shown = `${property}: ${value.trim().replace(/\s+/g, " ")}`;

    if (/!important/.test(value)) report("important", `${shown}`);
    // A token is where a raw value belongs, so a custom property may hold one.
    if (property.startsWith("--")) continue;

    if (/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/.test(value)) {
      report("raw-color", `${shown}. Use a token.`);
    }
    if (/gradient\(/.test(value)) report("gradient", `${shown}`);
    if (
      property === "font-family" &&
      !/var\(--font-/.test(value) &&
      !/^\s*inherit\s*$/.test(value)
    ) {
      report(
        "raw-font",
        `${shown}. Use var(--font-body), var(--font-heading), or var(--font-mono).`,
      );
    }
    if (property === "text-transform" && /uppercase/.test(value)) report("capitals", `${shown}`);
  }
  return allowed(findings, comments).sort((a, b) => a.line - b.line);
}

/** Drop the findings a lint-allow comment sets aside: on its own line, or the line after. */
function allowed(findings, comments) {
  const allows = comments.flatMap(({ line, text }) => {
    const [, rule, reason] = text.match(/^lint-allow\s+([a-z-]+)\s*:\s*(\S.*)$/s) ?? [];
    // The comment may run over several lines; it covers up to the line after its last.
    return rule && reason ? [{ rule, from: line, to: line + text.split("\n").length }] : [];
  });
  return findings.filter(
    ({ rule, line }) =>
      !allows.some((allow) => allow.rule === rule && line >= allow.from && line <= allow.to),
  );
}

/* The command line. */

/* The system's own folder, which is not the project's to mend. */
const OWN = resolve(fileURLToPath(new URL("..", import.meta.url)));

function filesUnder(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const full = join(path, entry.name);
    if (entry.isDirectory()) {
      const skip =
        resolve(full) === OWN || entry.name === "node_modules" || entry.name.startsWith(".");
      return skip ? [] : filesUnder(full);
    }
    return /\.(html|css)$/.test(entry.name) ? [full] : [];
  });
}

function main(args) {
  if (args.includes("--rules")) {
    for (const [rule, why] of Object.entries(RULES)) console.log(`${rule.padEnd(20)} ${why}`);
    return 0;
  }
  const json = args.includes("--json");
  const paths = args.filter((arg) => !arg.startsWith("--"));
  if (paths.length === 0) {
    console.error("Usage: node lint.js [--json] <file or folder> ...\n       node lint.js --rules");
    return 2;
  }

  const contract = JSON.parse(readFileSync(new URL("../contract.json", import.meta.url), "utf8"));
  const results = paths.flatMap(filesUnder).map((file) => {
    const source = readFileSync(file, "utf8");
    return { file, findings: file.endsWith(".css") ? lintCss(source) : lintHtml(source, contract) };
  });
  const count = results.reduce((sum, { findings }) => sum + findings.length, 0);

  if (json) {
    console.log(JSON.stringify({ files: results.length, findings: count, results }, null, 2));
  } else {
    for (const { file, findings } of results) {
      for (const { rule, line, message } of findings)
        console.log(`${file}:${line}  ${rule}  ${message}`);
    }
    console.log(
      count === 0
        ? `Clean: ${results.length} files.`
        : `\n${count} to mend, in ${results.filter(({ findings }) => findings.length).length} of ${results.length} files. "node lint.js --rules" says what each rule is for.`,
    );
  }
  return count === 0 ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = main(process.argv.slice(2));
}
