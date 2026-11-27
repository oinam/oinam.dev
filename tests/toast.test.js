import { mount } from "./dom.js";

import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const { toast } = await import("../public/ui/toast.js");

beforeEach(() => {
  document.body.replaceChildren();
});

const messages = () => [...document.querySelectorAll("onm-toast [role=status]")];

test("the region names itself for screen readers", () => {
  const region = mount("<onm-toast></onm-toast>");

  assert.equal(region.getAttribute("role"), "region");
  assert.equal(region.getAttribute("aria-label"), "Notifications");
});

test("a name the page gave the region is kept", () => {
  const region = mount('<onm-toast aria-label="News"></onm-toast>');
  assert.equal(region.getAttribute("aria-label"), "News");
});

test("showing a message adds it, as a status that does not take the focus", () => {
  const region = mount("<onm-toast></onm-toast>");

  const message = region.show("Saved");

  assert.equal(message.getAttribute("role"), "status");
  assert.equal(message.querySelector("span").textContent, "Saved");
  assert.notEqual(document.activeElement, message);
});

test("the text is shown as text, never read as markup", () => {
  const region = mount("<onm-toast></onm-toast>");

  const message = region.show("<img src=x> Saved");

  assert.equal(message.querySelector("img"), null);
  assert.equal(message.querySelector("span").textContent, "<img src=x> Saved");
});

test("a message goes away after six seconds", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const region = mount("<onm-toast></onm-toast>");
  region.show("Saved");

  mock.timers.tick(5999);
  assert.equal(messages().length, 1);

  mock.timers.tick(1);
  assert.equal(messages().length, 0);
  mock.timers.reset();
});

test("a message asked to stay, stays", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const region = mount("<onm-toast></onm-toast>");
  region.show("Still here", { staysFor: 0 });

  mock.timers.tick(60_000);

  assert.equal(messages().length, 1);
  mock.timers.reset();
});

test("Dismiss removes that message, and only that one", () => {
  const region = mount("<onm-toast></onm-toast>");
  const first = region.show("One");
  region.show("Two");

  first.querySelector("button").click();

  assert.deepEqual(
    messages().map((message) => message.querySelector("span").textContent),
    ["Two"],
  );
});

test("toast() adds a region when the page has none, and reuses it after", () => {
  toast("One");
  toast("Two");

  assert.equal(document.querySelectorAll("onm-toast").length, 1);
  assert.equal(messages().length, 2);
});

test("a button that carries a message shows it when pressed", () => {
  mount('<button type="button" data-toast="Berth 12 is yours">Book</button>').click();

  assert.equal(messages()[0].querySelector("span").textContent, "Berth 12 is yours");
});

test("a press on anything else shows nothing", () => {
  mount('<button type="button">Plain</button>').click();
  assert.equal(messages().length, 0);
});
