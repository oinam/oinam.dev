# Oinam UI

A design system in plain HTML, CSS, and JavaScript. No framework, no build step, and no
dependencies. This page is the whole of it, written for an AI agent to read once and then design
with.

- Live examples, for people: https://oinam.dev/ui/
- The same as data: https://oinam.dev/ui/registry.json
- Source: https://github.com/oinam/oinam.dev/tree/main/public/ui

## Install

Put these three lines in the `<head>`.

```html
<link rel="stylesheet" href="https://oinam.dev/ui/ui.css" />
<script src="https://oinam.dev/ui/theme-init.js"></script>
<script type="module" src="https://oinam.dev/ui/ui.js"></script>
```

- `ui.css` is the system. Most pages need nothing else.
- `theme-init.js` sets light or dark before the page paints. Leave it out if there is no theme
  toggle; the page then follows the system setting.
- `ui.js` is only for the elements marked "needs script" below.

For anything that has to last, copy the files instead of linking them. Every file under `/ui/`
stands alone. Start with `tokens.css` and `base.css`, then add the files of the components the page
uses; `registry.json` lists them.

## How it works

Three rules cover the whole system.

1. **A native element that does the job gets a class.** A button is a `<button class="button">`.
   A text field is an `<input class="input">`. The classes are `.button`, `.input`, `.choice`,
   `.dialog`, `.eyebrow`, and `.lede`. Variants of these are `data-` attributes:
   `data-variant="outline"`, `data-size="small"`.
2. **Anything HTML has no element for is a custom element.** Structure is spelled out in the tag
   names: `<o-stack>`, `<o-card>`, `<o-field>`. Every one starts with `o-`. Variants of these are
   plain attributes: `variant="warning"`, `gap="6"`.
3. **Script is the exception.** Most of the elements are styled by CSS alone and work with scripts
   off. Only four have behavior: `<o-tabs>`, `<o-copy>`, `<o-theme>`, and `<o-example>`. Each of
   them wraps ordinary HTML that still reads correctly if the script never runs.

Write plain, semantic HTML inside all of them: headings, paragraphs, lists, links. Unclassed
elements are already styled.

## Rules for designing with it

- **Two colors only.** Ink is nearly black; cloud is nearly white. Everything else is ink mixed
  into cloud. Do not add a hue. Show emphasis with weight, size, a border, or by swapping ink and
  cloud.
- **Use the tokens.** Never write a raw color, font, or radius. Use `var(--color-ink)`,
  `var(--space-4)`, `var(--radius-md)`.
- **Lay out with the layout elements**, not with margins. `<o-stack>` for a column, `<o-row>` for a
  row, `<o-grid>` for columns, `<o-wrap>` for the page width. Margins on headings and paragraphs
  are zero on purpose.
- **Light and dark come for free.** Every token already has both values. Do not write
  `prefers-color-scheme` rules of your own.
- **No inline styles.** Add a class and a rule to the page's own stylesheet instead. Page styles
  written outside a cascade layer always win over the system's, so no `!important` is needed.
- **No emoji.** Plain text.
- **Sentence case.** Headings and labels are written like sentences. No all-caps kickers, and no
  decorative numbers on sections.
- **One surface deep.** Do not put a card inside a card. Reach for spacing and type before a border
  or a box, and use one solid button per group, for the main action.
- **Honest copy.** Do not invent numbers, quotes, or logos. If a fact is not known, leave it out.
- **Every state.** A control must look right at rest, on hover, with keyboard focus, when pressed,
  when disabled, and when busy or invalid. The components already do; keep it so in page styles.

## A complete page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>Field notes</title>
    <link rel="stylesheet" href="https://oinam.dev/ui/ui.css" />
    <script src="https://oinam.dev/ui/theme-init.js"></script>
    <script type="module" src="https://oinam.dev/ui/ui.js"></script>
  </head>
  <body>
    <main>
      <o-wrap narrow>
        <o-stack gap="12">
          <o-stack gap="4" align="start">
            <p class="eyebrow">Field notes</p>
            <h1>Written for agents. Kept by hand.</h1>
            <p class="lede">A short opening paragraph.</p>
            <o-row>
              <a class="button" href="/docs/">Read the docs</a>
              <a class="button" data-variant="ghost" href="/about/">About</a>
            </o-row>
          </o-stack>

          <o-grid>
            <o-card>
              <h3>Standards</h3>
              <p>The rules every project inherits.</p>
              <footer><a class="button" data-variant="outline" href="/standards/">Read</a></footer>
            </o-card>
            <o-card>
              <h3>Components</h3>
              <p>Plain HTML, CSS, and JavaScript.</p>
              <footer><a class="button" data-variant="outline" href="/ui/">Browse</a></footer>
            </o-card>
          </o-grid>
        </o-stack>
      </o-wrap>
    </main>
  </body>
</html>
```

## Tokens

All of them are custom properties on `:root`, defined in `tokens.css`.

| Token                  | Value                                   | Use                              |
| ---------------------- | --------------------------------------- | -------------------------------- |
| `--color-ink`          | `#161618` light, `#eceef1` dark         | Text, solid buttons              |
| `--color-cloud`        | `#f5f6f8` light, `#0c0c0c` dark         | The page background              |
| `--color-milk`         | `#fcfcfd` light, `#161618` dark         | Raised surfaces: cards, fields   |
| `--color-ink-soft`     | 68% ink in cloud                        | Secondary text                   |
| `--color-ink-faint`    | 58% ink in cloud                        | Labels, placeholders             |
| `--color-line-strong`  | 24% ink in cloud                        | Borders of controls              |
| `--color-line`         | 12% ink in cloud                        | Hairlines, borders of surfaces   |
| `--color-wash`         | 6% ink, see-through                     | Hover fills                      |
| `--font-serif`         | Iowan Old Style, Baskerville, Times     | Headings                         |
| `--font-sans`          | The system UI font                      | Everything else                  |
| `--font-mono`          | The system monospace font               | Code, eyebrows, badges           |
| `--text-xs` to `-4xl`  | 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2 rem | Type sizes; `4xl` is fluid       |
| `--space-1` to `-16`   | 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4 rem    | Steps 1, 2, 3, 4, 6, 8, 12, 16   |
| `--radius-sm/md/lg`    | 6px, 10px, 14px, and `--radius-full`    | Small things, controls, surfaces |
| `--shadow-sm/md/lg`    | Three soft shadows                      | Fields, hover, dialogs           |
| `--control-sm/-/lg`    | 2rem, 2.5rem (`--control`), 3rem        | The height of a button or field  |
| `--duration`, `--ease` | 0.2s, an ease-out curve                 | Transitions                      |

To re-skin the system, override tokens in the page's own stylesheet:

```css
:root {
  --color-ink: light-dark(#1b1a17, #f2efe8);
  --color-cloud: light-dark(#f7f4ee, #12110f);
  --radius-md: 4px;
}
```

## Theme

The page follows the system setting. `data-theme="light"` or `data-theme="dark"` on `<html>` forces
one; `<o-theme>` sets it for you.

## Layout

### Wrap

`<o-wrap>` centers the page content and keeps it off the edges. 1600px wide at most. Add `narrow`
for a page of reading (56rem).

```html
<o-wrap narrow>
  <p>The content of the page.</p>
</o-wrap>
```

### Stack

`<o-stack>` is a column. `gap` takes a space step: `1`, `2`, `3`, `4` (default), `6`, `8`, `12`,
`16`. `align` takes `start` or `center`; without it, children stretch to full width.

```html
<o-stack gap="2">
  <h2>Title</h2>
  <p>Text under it.</p>
</o-stack>
```

### Row

`<o-row>` is a row that wraps. `gap` as above (default `3`). `justify` takes `between`, `center`,
or `end`. `align` takes `start` or `baseline`; the default centers children vertically.

```html
<o-row justify="between">
  <strong>Invoice 204</strong>
  <button class="button" type="button">Pay</button>
</o-row>
```

### Grid

`<o-grid>` lays out equal columns, as many as fit, with no breakpoints. `gap` as above (default
`6`). `min` sets how narrow a column may get: `small` (11rem), the default (16rem), or `large`
(24rem).

```html
<o-grid min="large" gap="8">
  <o-card>One</o-card>
  <o-card>Two</o-card>
</o-grid>
```

## Content

### Text

Headings (`h1` to `h4`) are set in the serif. Paragraphs, links, `<code>`, `<kbd>`, `<pre>`,
`<hr>`, `<strong>`, and `<small>` are styled as they are.

- `class="eyebrow"`: a small label above a heading, such as a date or a section name.
- `class="lede"`: the opening paragraph, a size up.

```html
<p class="eyebrow">Field notes</p>
<h1>A heading</h1>
<p class="lede">The opening paragraph.</p>
```

### Prose

`<o-prose>` is for a run of writing, such as an article. It gives plain headings, paragraphs, and
lists their spacing, so the HTML inside needs no classes.

```html
<o-prose>
  <h1>Standards</h1>
  <p>A change is not done until every point below holds.</p>
  <h2>Linted</h2>
  <ul>
    <li>Zero warnings.</li>
  </ul>
</o-prose>
```

### Card

`<o-card>` groups related things on a raised surface. A `<footer>` inside holds actions and stays
at the bottom, so cards in a row line up.

```html
<o-card>
  <h3>Standards</h3>
  <p>The rules every project inherits.</p>
  <footer><a class="button" data-variant="outline" href="/docs/">Read</a></footer>
</o-card>
```

### Badge

`<o-badge>` is a small label. `variant="solid"` fills it.

```html
<o-badge>Soon</o-badge> <o-badge variant="solid">New</o-badge>
```

### Alert

`<o-alert>` sets a message apart. `variant` takes `warning` (a heavy frame) or `danger` (ink and
cloud swapped); without it, the alert is a note. Give it `role="note"`, or `role="alert"` when it appears in answer to something the reader
just did. Open with a `<strong>` title.

```html
<o-alert variant="warning" role="note">
  <strong>Warning</strong>
  <p>This rewrites history.</p>
</o-alert>
```

### Table

`<o-table>` goes around a plain `<table>`. It draws the frame and lets a wide table scroll
sideways.

```html
<o-table>
  <table>
    <thead>
      <tr>
        <th scope="col">Token</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">--space-4</th>
        <td>1rem</td>
      </tr>
    </tbody>
  </table>
</o-table>
```

## Controls

### Button

`class="button"` on a `<button>` or an `<a>`.

- `data-variant`: `outline` or `ghost`. Without it, the button is solid ink. Use one solid button
  per group, for the main action.
- `data-size`: `small`, `large`, or `icon` (a square, for a lone icon; give it an `aria-label`).
- `disabled`, or `aria-disabled="true"` on a link.
- `aria-busy="true"` while it works: it shows a spinner and takes no more presses.

```html
<button class="button" type="button">Save</button>
<button class="button" data-variant="outline" type="button">Preview</button>
<button class="button" data-variant="ghost" data-size="small" type="button">Cancel</button>
<a class="button" data-size="large" href="/docs/">Read the docs</a>
```

### Field

`<o-field>` keeps a label, its control, and a line of help together. The control takes
`class="input"`, whether it is an `<input>`, a `<select>`, or a `<textarea>`. Always pair the
`<label for>` with the control's `id`.

```html
<o-field>
  <label for="email">Email</label>
  <input class="input" id="email" type="email" aria-describedby="email-help" />
  <small id="email-help">Used for sign-in only.</small>
</o-field>

<o-field>
  <label for="role">Role</label>
  <select class="input" id="role">
    <option>Reader</option>
    <option>Editor</option>
  </select>
</o-field>
```

Put several fields in an `<o-stack>`. An invalid field shows a dashed border once the visitor has
touched it; use the browser's own validation attributes (`required`, `type`, `pattern`). For an
error found on the server, set `aria-invalid="true"` on the control and say what is wrong in the
`<small>`.

### Choice and switch

A checkbox or a radio button sits inside a `<label class="choice">`. A switch is a checkbox with
`role="switch"`.

```html
<label class="choice"><input type="checkbox" /> Send me the changelog</label>
<label class="choice"><input type="radio" name="plan" /> Monthly</label>
<label class="choice"><input type="checkbox" role="switch" /> Deploy on push</label>
```

## Disclosure

### Accordion

`<o-accordion>` goes around a set of `<details>`. Give them all the same `name` to keep one open at
a time. Add `open` to the one that starts open.

```html
<o-accordion>
  <details name="faq" open>
    <summary>Is it free?</summary>
    <p>Yes.</p>
  </details>
  <details name="faq">
    <summary>Do I need a framework?</summary>
    <p>No.</p>
  </details>
</o-accordion>
```

### Tabs (needs script)

`<o-tabs>` turns a run of `<section>` elements into tabs. Each section opens with a heading, which
becomes the name of its tab. `label` names the set for screen readers. Without the script, the
sections follow one another under their headings.

```html
<o-tabs label="Install">
  <section>
    <h3>Link it</h3>
    <p>Point a stylesheet at oinam.dev.</p>
  </section>
  <section>
    <h3>Copy it</h3>
    <p>Take the files you need.</p>
  </section>
</o-tabs>
```

It fires `change` when the tab changes; its `selected` property is the index, and `select(index)`
shows a tab.

### Dialog

`class="dialog"` on a `<dialog>`. Buttons open and close it by naming its `id`, with `commandfor`
and `command`; there is no script to write. `closedby="any"` lets a click outside close it.

```html
<button class="button" type="button" commandfor="confirm" command="show-modal">Delete</button>

<dialog class="dialog" id="confirm" aria-labelledby="confirm-title" closedby="any">
  <h2 id="confirm-title">Delete the file?</h2>
  <p>This cannot be undone.</p>
  <footer>
    <button class="button" data-variant="ghost" type="button" commandfor="confirm" command="close">
      Cancel
    </button>
    <button class="button" type="button">Delete</button>
  </footer>
</dialog>
```

## Utilities

### Copy (needs script)

`<o-copy>` goes around a `<pre>` and adds a button that copies its text.

```html
<o-copy>
  <pre><code>mise run check</code></pre>
</o-copy>
```

### Theme (needs script)

`<o-theme>` goes around a `<button>` and makes it a light and dark toggle. It remembers the choice
and follows the system until one is made. It keeps the button's `aria-label` current. To hide the
button until the script is ready, add `o-theme:not(:defined) { visibility: hidden; }` to the page.

```html
<o-theme>
  <button class="button" data-variant="ghost" type="button">Switch theme</button>
</o-theme>
```

### Example (needs script)

`<o-example>` shows a piece of markup live and prints its source beside it, with a copy button. It
is for documentation pages.

```html
<o-example>
  <button class="button" type="button">Save</button>
</o-example>
```

## Not here yet

There is no menu, tooltip, toast, or date picker. If a page needs one, build it from native HTML
(`popover`, `<details>`, `<dialog>`) and the tokens above, in the same style: a native element with
a class where one does the job, an `o-` element where none does, and script only as an
enhancement.
