import { mount, press } from "./dom.js";

import assert from "node:assert/strict";
import { test } from "node:test";

await import("../public/ui/tabs.js");

const MARKUP = `
  <o-tabs label="Install">
    <section><h3>Link it</h3><p>One.</p></section>
    <section><h3>Copy it</h3><p>Two.</p></section>
    <section><h3>Change it</h3><p>Three.</p></section>
  </o-tabs>`;

function build(markup = MARKUP) {
  const tabs = mount(markup);
  return {
    tabs,
    list: tabs.querySelector('[role="tablist"]'),
    buttons: [...tabs.querySelectorAll('[role="tab"]')],
    panels: [...tabs.querySelectorAll('[role="tabpanel"]')],
  };
}

const selected = (buttons) => buttons.map((tab) => tab.getAttribute("aria-selected"));
const hidden = (panels) => panels.map((panel) => panel.hidden);

test("each section becomes a tab named after its heading", () => {
  const { list, buttons } = build();

  assert.equal(list.getAttribute("aria-label"), "Install");
  assert.deepEqual(
    buttons.map((tab) => tab.textContent),
    ["Link it", "Copy it", "Change it"],
  );
});

test("the headings are hidden, because the tabs now say the same", () => {
  const { panels } = build();
  assert.ok(panels.every((panel) => panel.querySelector("h3").hidden));
});

test("tabs and panels point at each other", () => {
  const { buttons, panels } = build();

  buttons.forEach((tab, at) => {
    assert.equal(tab.getAttribute("aria-controls"), panels[at].id);
    assert.equal(panels[at].getAttribute("aria-labelledby"), tab.id);
  });
});

test("two sets of tabs never share an id", () => {
  const first = build().buttons.map((tab) => tab.id);
  const second = build().buttons.map((tab) => tab.id);
  assert.equal(new Set([...first, ...second]).size, 6);
});

test("the first tab starts selected, and only its panel shows", () => {
  const { buttons, panels } = build();

  assert.deepEqual(selected(buttons), ["true", "false", "false"]);
  assert.deepEqual(hidden(panels), [false, true, true]);
});

test("only the selected tab is in the tab order", () => {
  const { buttons } = build();
  assert.deepEqual(
    buttons.map((tab) => tab.tabIndex),
    [0, -1, -1],
  );
});

test("a click selects a tab and fires change", () => {
  const { tabs, buttons, panels } = build();
  let changes = 0;
  tabs.addEventListener("change", () => changes++);

  buttons[1].click();

  assert.equal(tabs.selected, 1);
  assert.deepEqual(selected(buttons), ["false", "true", "false"]);
  assert.deepEqual(hidden(panels), [true, false, true]);
  assert.equal(changes, 1);
});

test("selecting the tab already on show changes nothing", () => {
  const { tabs, buttons } = build();
  let changes = 0;
  tabs.addEventListener("change", () => changes++);

  buttons[0].click();

  assert.equal(changes, 0);
});

test("the arrow keys move between tabs and wrap at the ends", () => {
  const { tabs, list } = build();

  press(list, "ArrowRight");
  assert.equal(tabs.selected, 1);

  press(list, "ArrowLeft");
  press(list, "ArrowLeft");
  assert.equal(tabs.selected, 2);

  press(list, "ArrowRight");
  assert.equal(tabs.selected, 0);
});

test("Home and End jump to the first and the last tab", () => {
  const { tabs, list } = build();

  press(list, "End");
  assert.equal(tabs.selected, 2);

  press(list, "Home");
  assert.equal(tabs.selected, 0);
});

test("the keyboard moves focus along with the selection", () => {
  const { list, buttons } = build();

  press(list, "ArrowRight");

  assert.equal(document.activeElement, buttons[1]);
});

test("a section without a heading still gets a tab", () => {
  const { buttons } = build("<o-tabs><section><p>One.</p></section></o-tabs>");
  assert.equal(buttons[0].textContent, "Tab 1");
});

test("an element with no sections is left alone", () => {
  const { list } = build("<o-tabs><p>Nothing to tab.</p></o-tabs>");
  assert.equal(list, null);
});

test("moving the element does not build the tabs twice", () => {
  const { tabs } = build();

  document.body.append(tabs);

  assert.equal(tabs.querySelectorAll('[role="tablist"]').length, 1);
});
