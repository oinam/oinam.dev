#!/usr/bin/env node
/*
 * Oinam UI: a Model Context Protocol server.
 *
 * It lets an agent ask for one thing at a time: the guide, the page of one
 * component, one pattern, or a check of what it has written. It answers from
 * the project's own copy of the system, the folder this file is in, so it
 * works with no network and always matches the version the project has.
 *
 * To use it, tell the agent's host about it. For Claude Code, in .mcp.json at
 * the root of the project:
 *
 *   { "mcpServers": { "oinam-ui": { "command": "node", "args": ["ui/tools/mcp.js"] } } }
 *
 * It speaks JSON-RPC over standard input and output, one message to a line,
 * as the protocol's stdio transport says. It needs Node 20 or later and
 * nothing else.
 */

import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

import { lintCss, lintHtml } from "./lint.js";

const UI = new URL("../", import.meta.url);
const read = (name) => readFileSync(new URL(name, UI), "utf8");
const registry = () => JSON.parse(read("registry.json"));

/** The protocol version this server was written against. */
const PROTOCOL = "2025-06-18";

const text = (value) => ({ content: [{ type: "text", text: value }] });
const failed = (value) => ({ ...text(value), isError: true });

/** Find one of a list by name, or say which names there are. */
function pick(list, name, kind) {
  const found = list.find((one) => one.name === name);
  if (found) return found;
  throw new Error(
    `There is no ${kind} called "${name}". There are: ${list.map((one) => one.name).join(", ")}.`,
  );
}

/**
 * The tools, each with what it is for, what it takes, and what it does.
 * A description is written for the agent that will read it.
 */
export const TOOLS = {
  guide: {
    description:
      "The Oinam UI guide: how to take the system, the rules for designing with it, how to make a first draft that does not look generated, and the list of components. Read this first, before designing or building any page.",
    inputSchema: { type: "object", properties: {} },
    run: () => text(read("guide.md")),
  },
  list_components: {
    description:
      "Every component of Oinam UI: its name, how it is written, what it is, and whether it needs script. Use a name from this list with the component tool.",
    inputSchema: { type: "object", properties: {} },
    run: () =>
      text(
        registry()
          .components.map(
            ({ name, use, description, script }) =>
              `${name}  ${use}  ${description}${script ? " (needs script)" : ""}`,
          )
          .join("\n"),
      ),
  },
  component: {
    description:
      "The page of one component: its markup, its attributes and their values, and what to watch for. Read it before using a component for the first time; do not guess at its markup.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A name from list_components, such as button or tabs.",
        },
      },
      required: ["name"],
    },
    run: ({ name }) => text(read(pick(registry().components, name, "component").doc)),
  },
  list_patterns: {
    description:
      "The patterns: whole pages built from the components, such as a form, a table view, and a dashboard. Use a name from this list with the pattern tool.",
    inputSchema: { type: "object", properties: {} },
    run: () =>
      text(
        registry()
          .patterns.pages.map(({ name, title, shows }) => `${name}  ${title}. ${shows}`)
          .join("\n"),
      ),
  },
  pattern: {
    description:
      "The source of one pattern, a whole page, opening with a comment that says why it is laid out as it is. Read the one nearest the page you are asked for before composing it. Take its structure, not its words.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A name from list_patterns, such as form or dashboard.",
        },
      },
      required: ["name"],
    },
    run: ({ name }) => text(read(pick(registry().patterns.pages, name, "pattern").file)),
  },
  tokens: {
    description:
      "Every token of the system as CSS custom properties: colors, type, space, shape, and motion. Use these, and never a raw value.",
    inputSchema: { type: "object", properties: {} },
    run: () => text(read("tokens.css")),
  },
  why: {
    description:
      "What each rule of the system protects, what it costs, and when it may be bent. Read it before breaking a rule, or when the owner asks you to.",
    inputSchema: { type: "object", properties: {} },
    run: () => text(read("why.md")),
  },
  lint: {
    description:
      "Check markup or a stylesheet you have written against the rules a program can check: unknown elements, attributes, and values, controls with no name, raw colors, and the habits the guide warns of. Run it before handing work back, and mend what it reports. A clean result does not mean the page looks right.",
    inputSchema: {
      type: "object",
      properties: {
        html: { type: "string", description: "The source of a page, or a piece of one." },
        css: { type: "string", description: "The source of a stylesheet." },
      },
    },
    run: ({ html, css }) => {
      if (html === undefined && css === undefined) throw new Error("Give html, css, or both.");
      const contract = JSON.parse(read("contract.json"));
      const findings = [
        ...(html === undefined
          ? []
          : lintHtml(html, contract).map((finding) => ({ in: "html", ...finding }))),
        ...(css === undefined ? [] : lintCss(css).map((finding) => ({ in: "css", ...finding }))),
      ];
      if (findings.length === 0) return text("Clean. Nothing to mend.");
      return text(
        `${findings.length} to mend:\n` +
          findings
            .map(
              (finding) =>
                `${finding.in} line ${finding.line}  ${finding.rule}  ${finding.message}`,
            )
            .join("\n"),
      );
    },
  },
};

/**
 * Answer one message. Returns the reply, or nothing for a message that wants none.
 *
 * @param {{ jsonrpc: string, id?: number | string, method: string, params?: any }} message
 */
export function answer(message) {
  const { id, method, params = {} } = message;
  const reply = (result) => ({ jsonrpc: "2.0", id, result });
  const refuse = (code, why) => ({ jsonrpc: "2.0", id, error: { code, message: why } });

  // A message without an id is a notification, and gets no answer.
  if (id === undefined) return undefined;

  switch (method) {
    case "initialize":
      return reply({
        protocolVersion: params.protocolVersion ?? PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: "oinam-ui", title: "Oinam UI", version: registry().version },
        instructions:
          "Oinam UI is a design system in plain HTML, CSS, and JavaScript. Before designing or building a page, call guide. Before using a component, call component with its name. Before handing work back, call lint.",
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({
        tools: Object.entries(TOOLS).map(([name, { description, inputSchema }]) => ({
          name,
          description,
          inputSchema,
        })),
      });
    case "tools/call": {
      const tool = TOOLS[params.name];
      if (!tool) return refuse(-32602, `There is no tool called "${params.name}".`);
      try {
        return reply(tool.run(params.arguments ?? {}));
      } catch (error) {
        // A tool that could not do its work says so in its result, where the agent will read it.
        return reply(failed(error.message));
      }
    }
    default:
      return refuse(-32601, `"${method}" is not something this server does.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const lines = createInterface({ input: process.stdin });
  lines.on("line", (line) => {
    if (!line.trim()) return;
    let reply;
    try {
      reply = answer(JSON.parse(line));
    } catch {
      reply = { jsonrpc: "2.0", id: null, error: { code: -32700, message: "That was not JSON." } };
    }
    if (reply) process.stdout.write(`${JSON.stringify(reply)}\n`);
  });
}
