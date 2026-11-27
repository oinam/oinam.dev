import { mount, press } from "./dom.js";

import assert from "node:assert/strict";
import { test } from "node:test";

await import("../public/ui/menu.js");

const MARKUP = `
  <onm-menu>
    <button type="button" popovertarget="actions">Berth 12</button>
    <div id="actions" popover>
      <button type="button">Rename</button>
      <a href="#open">Open</a>
      <hr />
      <button type="button" disabled>Release</button>
      <button type="button">Leave</button>
    </div>
  </onm-menu>`;

function build(markup = MARKUP) {
  const menu = mount(markup);
  const list = menu.querySelector("[popover]");
  // The test browser may not open popovers; what matters here is that the menu asks.
  const asked = [];
  list.showPopover = () => asked.push("show");
  list.hidePopover = () => asked.push("hide");
  return { menu, list, asked };
}

const labels = (items) => items.map((item) => item.textContent);

test("its items are the links and buttons that can be chosen, in order", () => {
  const { menu } = build();
  assert.deepEqual(labels(menu.items), ["Rename", "Open", "Leave"]);
});

test("the arrow keys move the focus between items, and wrap at the ends", () => {
  const { menu, list } = build();
  const [rename, open, leave] = menu.items;
  rename.focus();

  press(list, "ArrowDown");
  assert.equal(document.activeElement, open);

  press(list, "ArrowDown");
  press(list, "ArrowDown");
  assert.equal(document.activeElement, rename);

  press(list, "ArrowUp");
  assert.equal(document.activeElement, leave);
});

test("a disabled item is stepped over", () => {
  const { menu, list } = build();
  menu.items[1].focus();

  press(list, "ArrowDown");

  assert.equal(document.activeElement.textContent, "Leave");
});

test("Home and End jump to the first and the last item", () => {
  const { menu, list } = build();
  menu.items[1].focus();

  press(list, "End");
  assert.equal(document.activeElement.textContent, "Leave");

  press(list, "Home");
  assert.equal(document.activeElement.textContent, "Rename");
});

test("choosing an item closes the list", () => {
  const { menu, asked } = build();

  menu.items[0].click();

  assert.deepEqual(asked, ["hide"]);
});

test("a click on the rule between groups closes nothing", () => {
  const { list, asked } = build();

  list.querySelector("hr").click();

  assert.deepEqual(asked, []);
});

test("keys pressed on the button are left to the browser", () => {
  const { menu } = build();
  const button = menu.querySelector("[popovertarget]");
  button.focus();

  press(button, "ArrowDown");

  assert.equal(document.activeElement, button);
});

test("a right click does nothing unless the menu is a context menu", () => {
  const { menu, asked } = build();

  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  menu.dispatchEvent(event);

  assert.deepEqual(asked, []);
  assert.equal(event.defaultPrevented, false);
});

test("a context menu opens where the pointer is", () => {
  const { menu, list, asked } = build(`
    <onm-menu context>
      <p>The quay</p>
      <div popover><button type="button">Book this berth</button></div>
    </onm-menu>`);

  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: 120,
    clientY: 80,
  });
  menu.querySelector("p").dispatchEvent(event);

  assert.deepEqual(asked, ["show"]);
  assert.equal(event.defaultPrevented, true);
  assert.equal(list.style.left, "120px");
  assert.equal(list.style.top, "80px");
});

test("a menu with no list does nothing, and does not fail", () => {
  const menu = mount("<onm-menu><button type='button'>Nothing</button></onm-menu>");
  menu.querySelector("button").click();
  assert.equal(menu.list, null);
});
