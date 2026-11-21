/*
 * contract.json says what each element and class accepts. It is kept by hand,
 * and the linter believes it. These tests hold it to the stylesheets, which
 * are what a browser believes, and to the registry.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const UI = new URL("../public/ui/", import.meta.url);
const read = (name) => readFileSync(new URL(name, UI), "utf8");

const contract = JSON.parse(read("contract.json"));
const registry = JSON.parse(read("registry.json"));

const sheets = readdirSync(UI).filter((name) => name.endsWith(".css"));
const css = sheets.map((name) => read(name).replace(/\/\*[\s\S]*?\*\//g, "")).join("\n");

/** What an entry of the contract allows for one attribute, as a list of values. */
const allowed = (entry, attribute) => {
  const values = entry.attributes[attribute];
  return values === true ? [""] : values === "text" ? null : (values ?? []);
};

const entryFor = (subject) =>
  subject.startsWith(".") ? contract.classes[subject.slice(1)] : contract.elements[subject];

/**
 * Every (subject, attribute, value) the stylesheets select on, where a subject
 * is a custom element or a class: `o-stack[gap="2"]`, `.button[data-size="small"]`,
 * and the same inside `:is(...)`.
 */
function selected() {
  const found = [];
  const pattern =
    /(:is\(([^)]*)\)|o-[a-z-]+|\.[a-z-]+)((?:\[[^\]]+\])+|:is\(((?:\[[^\]]+\],?\s*)+)\))/g;

  for (const [, subject, list, attributes] of css.matchAll(pattern)) {
    const subjects = list ? list.split(",").map((part) => part.trim()) : [subject];
    for (const one of subjects.filter((part) => /^(o-[a-z-]+|\.[a-z-]+)$/.test(part))) {
      for (const [, attribute, value = ""] of attributes.matchAll(
        /\[([a-z-]+)(?:="([^"]*)")?\]/g,
      )) {
        found.push({ subject: one, attribute, value });
      }
    }
  }
  return found;
}

/* States the browser sets, not the author. */
const STATES = new Set(["open"]);

test("every custom element the stylesheets style is in the contract", () => {
  for (const element of new Set(css.match(/\bo-[a-z]+(?:-[a-z]+)*\b/g))) {
    assert.ok(element in contract.elements, `${element} is styled but not in the contract`);
  }
});

test("every element in the contract is styled, or defined by a script", () => {
  const scripts = readdirSync(UI)
    .filter((name) => name.endsWith(".js"))
    .map(read)
    .join("\n");

  for (const element of Object.keys(contract.elements)) {
    const styled = new RegExp(`(^|[^a-z-])${element}([^a-z-]|$)`, "m").test(css);
    const defined = scripts.includes(`customElements.define("${element}"`);
    assert.ok(styled || defined, `${element} is in the contract but nowhere else`);
  }
});

test("every attribute and value the stylesheets select on is in the contract", () => {
  for (const { subject, attribute, value } of selected()) {
    if (STATES.has(attribute)) continue;
    const entry = entryFor(subject);
    assert.ok(entry, `${subject} is not in the contract`);

    const values = allowed(entry, attribute);
    assert.ok(attribute in entry.attributes, `${subject} has no "${attribute}" in the contract`);
    // A bare [attribute] selector matches any value, so it proves nothing about values.
    if (values && value !== "") {
      assert.ok(
        values.includes(value),
        `${subject} ${attribute}="${value}" is not in the contract`,
      );
    }
  }
});

test("every value in the contract is one the stylesheets act on", () => {
  const acted = selected();
  // Values that are the default, or that only a script reads, and so have no rule of their own.
  const silent = new Set(['.button aria-busy="false"']);

  for (const [subject, entry] of [
    ...Object.entries(contract.elements),
    ...Object.entries(contract.classes).map(([name, value]) => [`.${name}`, value]),
  ]) {
    for (const attribute of Object.keys(entry.attributes)) {
      for (const value of allowed(entry, attribute) ?? []) {
        if (silent.has(`${subject} ${attribute}="${value}"`)) continue;
        const hit = acted.some(
          (one) => one.subject === subject && one.attribute === attribute && one.value === value,
        );
        assert.ok(hit, `${subject} ${attribute}="${value}" is in the contract but styled nowhere`);
      }
    }
  }
});

test("every element and class belongs to a component in the registry", () => {
  const components = new Set(registry.components.map((component) => component.name));

  for (const [name, entry] of [
    ...Object.entries(contract.elements),
    ...Object.entries(contract.classes),
  ]) {
    assert.ok(components.has(entry.component), `${name} names "${entry.component}"`);
  }
});

test("every element and class the registry shows is in the contract", () => {
  for (const { name, use } of registry.components) {
    for (const [, element] of use.matchAll(/<(o-[a-z-]+)>/g)) {
      assert.ok(element in contract.elements, `${name}: ${element}`);
    }
    for (const [, className] of use.matchAll(/(?:^|[\s,])\.([a-z-]+)/g)) {
      assert.ok(className in contract.classes, `${name}: .${className}`);
    }
  }
});
