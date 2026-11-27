import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { test } from "node:test";

const { dedent } = await import("../public/ui/example.js");

test("dedent strips the indentation the markup shares", () => {
  assert.equal(dedent("\n    <p>\n      Hi\n    </p>\n  "), "<p>\n  Hi\n</p>");
});

test("dedent ignores blank lines when measuring", () => {
  assert.equal(dedent("\n  <p>One</p>\n\n  <p>Two</p>\n"), "<p>One</p>\n\n<p>Two</p>");
});

test("dedent leaves flush markup alone", () => {
  assert.equal(dedent("<p>Hi</p>"), "<p>Hi</p>");
});

const build = () =>
  mount(`
    <onm-example>
      <button class="onm-button" type="button" disabled>Save</button>
    </onm-example>`);

test("the markup stays live, under a Preview heading", () => {
  const example = build();
  const preview = example.querySelector('[data-part="preview"]');

  assert.equal(preview.querySelector("h4").textContent, "Preview");
  assert.equal(preview.querySelector("button.onm-button").textContent, "Save");
});

test("the same markup is printed as its source", () => {
  const example = build();

  assert.equal(
    example.querySelector("onm-copy pre code").textContent,
    '<button class="onm-button" type="button" disabled>Save</button>',
  );
});

test("moving the element does not print the source of the source", () => {
  const example = build();

  document.body.append(example);

  assert.equal(example.querySelectorAll("pre").length, 1);
});
