import assert from "node:assert/strict";
import { test } from "node:test";

import { rank } from "../public/assets/search.js";

const docs = {
  title: "Docs",
  url: "/docs/",
  text: "Start here. The standards every project inherits.",
};
const standards = {
  title: "Standards",
  url: "/docs/#standards",
  text: "Linted, formatted, and tested.",
};
const play = {
  title: "Play",
  url: "/play/",
  text: "Coming soon. A place to tinker with the docs.",
};
const entries = [docs, standards, play];

const titles = (query) => rank(entries, query).map((entry) => entry.title);

test("an empty query returns every entry in its original order", () => {
  assert.deepEqual(titles(""), ["Docs", "Standards", "Play"]);
  assert.deepEqual(titles("   "), ["Docs", "Standards", "Play"]);
});

test("the result is a new array, and the input is left alone", () => {
  const result = rank(entries, "");
  assert.notEqual(result, entries);
  assert.deepEqual(entries, [docs, standards, play]);
});

test("a title match outranks a text match", () => {
  assert.deepEqual(titles("docs"), ["Docs", "Play"]);
});

test("a match at the start of a title outranks one inside it", () => {
  const inside = { title: "The Standards", url: "/a/", text: "" };
  const start = { title: "Standards", url: "/b/", text: "" };
  assert.deepEqual(rank([inside, start], "standards"), [start, inside]);
});

test("matching ignores case", () => {
  assert.deepEqual(titles("PLAY"), ["Play"]);
});

test("every word must match, in any order", () => {
  assert.deepEqual(titles("tested linted"), ["Standards"]);
  assert.deepEqual(titles("linted tinker"), []);
});

test("entries that tie keep their original order", () => {
  assert.deepEqual(titles("the"), ["Docs", "Play"]);
});

test("a query that matches nothing returns nothing", () => {
  assert.deepEqual(titles("zeppelin"), []);
});
