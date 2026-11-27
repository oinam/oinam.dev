/*
 * <onm-example>: markup at work, and its source beside it.
 *
 *   <onm-example>
 *     <button class="onm-button" type="button">Save</button>
 *   </onm-example>
 *
 * Write the markup once. This element shows it live under a "Preview" tab and
 * prints the very same markup under a "Code" tab, with a copy button, so the
 * example and its source can never drift apart.
 *
 * It builds on <onm-tabs> and <onm-copy>. Define this element before those two
 * (ui.js does), because it has to read its own markup before anything inside
 * it has had the chance to rewrite theirs.
 */

/**
 * Strip the indentation a block of markup picked up from the page around it.
 *
 * @param {string} markup
 * @returns {string} The markup, flush left, without blank lines at the ends.
 */
export function dedent(markup) {
  const lines = markup
    .replace(/^\s*\n/, "")
    .trimEnd()
    .split("\n");
  const depths = lines.filter((line) => line.trim()).map((line) => line.search(/\S/));
  const depth = Math.min(...depths);

  return lines.map((line) => line.slice(depth)).join("\n");
}

/**
 * @param {string} title
 * @param {(Node | string)[]} children
 */
function section(title, ...children) {
  const heading = document.createElement("h4");
  heading.textContent = title;

  const element = document.createElement("section");
  element.append(heading, ...children);
  return element;
}

export class Example extends HTMLElement {
  #built = false;

  connectedCallback() {
    if (this.#built) return;
    this.#built = true;

    // The browser writes a bare attribute back as name="". Say it the short way.
    const code = document.createElement("code");
    code.textContent = dedent(this.innerHTML).replaceAll('=""', "");

    const pre = document.createElement("pre");
    pre.append(code);
    const copy = document.createElement("onm-copy");
    copy.append(pre);

    const preview = section("Preview", ...this.childNodes);
    preview.dataset.part = "preview";

    const tabs = document.createElement("onm-tabs");
    tabs.setAttribute("label", "Example");
    tabs.append(preview, section("Code", copy));
    this.append(tabs);
  }
}

if (!customElements.get("onm-example")) customElements.define("onm-example", Example);
