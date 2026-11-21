# Oinam UI v0.2.0

A design system in plain HTML, CSS, and JavaScript. No framework, no build step, and no
dependencies. This page is the whole of it, written for an AI agent to read once and then design
with. It exists so that the first draft of a page does not look like every other page an AI has
made.

If you were sent to https://oinam.dev/ and told to build with it, this is the page you were sent
for.

- Live examples, for people: https://oinam.dev/ui/
- The same as data: https://oinam.dev/ui/registry.json
- What changed in each version: https://oinam.dev/ui/CHANGELOG.md
- Source: https://github.com/oinam/oinam.dev/tree/main/public/ui

## Install

Take a copy. The system is meant to live inside your project, not to be linked from oinam.dev.

```sh
curl -fsSL https://oinam.dev/ui/install.sh | sh
```

This puts every file in `./ui/`. To put them elsewhere, name the folder:
`curl -fsSL https://oinam.dev/ui/install.sh | sh -s -- public/ui`. It needs only a shell and curl.
Where there is no shell, download the files that `registry.json` names into one folder, keeping
their names.

Then link your own copy from the `<head>`, with the path as your site serves it.

```html
<link rel="stylesheet" href="/ui/ui.css" />
<script src="/ui/theme-init.js"></script>
<script type="module" src="/ui/ui.js"></script>
```

- `ui.css` is the system. Most pages need nothing else.
- `theme-init.js` sets light or dark before the page paints. Leave it out if there is no theme
  toggle; the page then follows the system setting.
- `ui.js` is only for the elements marked "needs script" below.

From then on the files are yours. Nothing in them points back at oinam.dev, and a page that uses
them makes no request to anyone else. Every file stands alone, so a page can also link only the
ones it uses: `tokens.css` and `base.css` first, then the files `registry.json` lists for each
component.

## Upgrade

The version a project has is the `version` in its own `ui/registry.json`. The newest is at
https://oinam.dev/ui/registry.json. To bring a project up to date, do these in order.

1. **Run the installer again**, naming the same folder.
   `curl -fsSL https://oinam.dev/ui/install.sh | sh -s -- ui`
   It replaces the files the project has not changed. A file the project has changed is never
   overwritten: it stays as it is, and the new one is put beside it as `<name>.new`. The installer
   prints what it did. Read all of it.
2. **Read the changelog.** In `ui/CHANGELOG.md`, read every entry above the version the project
   had, oldest first. Under each "What to do" are the changes the project's own pages need: a class,
   an element, an attribute, or a token that was renamed or removed. Search the project's HTML, CSS,
   and JavaScript for each one named, and make the change everywhere it appears.
3. **Merge the kept files.** For each file the installer kept, compare it with its `.new`. Carry the
   project's change into the new file, put that in place of the old one, and delete the `.new`. If
   the project's change and the system's change cannot both stand, stop and ask the owner which
   they want.
4. **Delete what was dropped.** If the installer names files that are no longer part of the system,
   check that no page links to them, then delete them.
5. **Look at the pages.** Open the pages the changes touched, in light and in dark, and check that
   they look and work as before.
6. **Tell the owner** the version it was and the version it is, what you changed in their pages and
   why, and anything left for them to decide.

Upgrades stay easy when the `ui/` folder is left as it was installed. Put a project's own styles,
its variation, and its own components in files outside that folder.

## In a project

After installing, add this to the project's `AGENTS.md`, or whichever file its agents read first, so
that every agent working there finds the system.

```markdown
## Design

This project is designed with Oinam UI, which is in `ui/`. Before designing or changing any page,
read `ui/guide.md` and follow it. Do not edit the files in `ui/`. This project's own styles go in
their own files, outside that folder.
```

Keep the project's own work outside `ui/`: its styles, its variation, and its own components. Then
the folder can be upgraded without a merge.

## How it works

Three rules cover the whole system.

1. **A native element that does the job gets a class.** A button is a `<button class="button">`.
   A text field is an `<input class="input">`. The classes are `.button`, `.input`, `.choice`, `.toggle`, `.slider`, `.progress`,
   `.dialog`, `.popover`, `.breadcrumb`, `.pagination`, `.eyebrow`, and `.lede`.button`, `.input`, `.choice`,
`.dialog`, `.eyebrow`, and `.lede`. Variants of these are `data-`attributes:`data-variant="outline"`, `data-size="small"`.
2. **Anything HTML has no element for is a custom element.** Structure is spelled out in the tag
   names: `<o-stack>`, `<o-card>`, `<o-field>`. Every one starts with `o-`. Variants of these are
   plain attributes: `variant="warning"`, `gap="6"`.
3. **Script is the exception.** Most of the elements are styled by CSS alone and work with scripts
   off. Only six have behavior: `<o-tabs>`, `<o-menu>`, `<o-copy>`, `<o-theme>`, `<o-toast>`, and
   `<o-example>`. Each of
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

## Make the first draft look made

A page built with this system should not look like the page every AI makes. The components take
care of the surface: there are no gradients here, no glows, and one pair of colors. The rest is
judgment, and it is yours. The first draft is the one that must not look generated, because it is
the one the owner sees.

### Start from what the page has to say

- Write down, in one sentence, what the reader came for. That is the first thing on the page.
- Let the content choose the layout. Do not reach for hero, three cards, call to action, footer. A
  price list is a table. A process is a numbered list. A choice is two things side by side. An
  article is `<o-prose>`.
- One thing leads on each screen. If everything is the same size and weight, nothing has been
  decided yet.
- Use real words. If you were not given the copy, write plain and specific copy from what you know,
  and tell the owner which parts you wrote. Never invent a number, a quote, a customer, or a logo.

### Then leave out the habits

- No label in capitals above every heading, and no "01, 02, 03" on sections. Headings and labels
  are written like sentences.
- No row of three or four equal cards, each an icon, a title, and a sentence.
- No icon that is only decoration, and no emoji standing in for one.
- No badge on ordinary text. A badge is for a status.
- No card inside a card, and no box around what spacing already groups. Reach for space and type
  before a border.
- No two solid buttons side by side. One main action per group; the rest are outline or ghost.
- No centered paragraphs. Center a short heading at most. Set everything else from the left, in
  lines of 60 to 70 characters; `<o-wrap narrow>` and `<o-prose>` do this.
- No heading that could sit on any site, such as "Unlock your potential". Say the particular thing.
- No button that says "Get started" or "Learn more". Say what it does: "Book a berth", "Read the
  guide".
- No motion that is not the answer to something the reader just did.
- No section added to make the page longer. Short is fine.

### Before you hand it back, look at it

Open the page. Do not only read its source.

- At 320, 768, and 1440 pixels wide: nothing runs off the side, and no button's label wraps.
- In light, and in dark.
- With the keyboard alone: every control can be reached, and you can see where you are.
- In every state the page can be in: empty, loading, wrong input, a very long name, no results. A
  control must look right at rest, on hover, with focus, when pressed, when disabled, and when busy
  or invalid.
- Read only the headings, top to bottom. They should tell the page's story by themselves.
- Ask of each border, box, badge, and sentence: if it went, would anything be lost? If not, take
  it out.

Then tell the owner what you were unsure of. Do not hide it.

## A complete page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>Field notes</title>
    <link rel="stylesheet" href="/ui/ui.css" />
    <script src="/ui/theme-init.js"></script>
    <script type="module" src="/ui/ui.js"></script>
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

| Token                           | Value                                   | Use                                            |
| ------------------------------- | --------------------------------------- | ---------------------------------------------- |
| `--color-ink`                   | `#161618` light, `#eceef1` dark         | Text, solid buttons                            |
| `--color-cloud`                 | `#f5f6f8` light, `#0c0c0c` dark         | The page background                            |
| `--color-milk`                  | `#fcfcfd` light, `#161618` dark         | Raised surfaces: cards, fields                 |
| `--color-ink-soft`              | 68% ink in cloud                        | Secondary text                                 |
| `--color-ink-faint`             | 58% ink in cloud                        | Labels, placeholders                           |
| `--color-line-strong`           | 24% ink in cloud                        | Borders of controls                            |
| `--color-line`                  | 12% ink in cloud                        | Hairlines, borders of surfaces                 |
| `--color-wash`                  | 6% ink, see-through                     | Hover fills                                    |
| `--font-serif`                  | Iowan Old Style, Baskerville, Times     | Headings                                       |
| `--font-sans`                   | The system UI font                      | Everything else                                |
| `--font-mono`                   | The system monospace font               | Code, eyebrows, badges                         |
| `--font-heading`, `--font-body` | The serif, and the sans                 | What headings, and everything else, are set in |
| `--text-xs` to `-4xl`           | 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2 rem | Type sizes; `4xl` is fluid                     |
| `--space-1` to `-16`            | 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4 rem    | Steps 1, 2, 3, 4, 6, 8, 12, 16                 |
| `--radius-sm/md/lg`             | 6px, 10px, 14px, and `--radius-full`    | Small things, controls, surfaces               |
| `--shadow-sm/md/lg`             | Three soft shadows                      | Fields, hover, dialogs                         |
| `--control-sm/-/lg`             | 2rem, 2.5rem (`--control`), 3rem        | The height of a button or field                |
| `--duration`, `--ease`          | 0.2s, an ease-out curve                 | Transitions                                    |

## Base and variations

The design described here is called **Base**. It is the default, and every other design comes out
of it.

A variation is a new look made by changing tokens and nothing else: another ink and cloud, other
fonts, sharper or rounder corners, tighter or looser space. The components are never edited to make
one. A variation is one small stylesheet that holds only the values that differ from Base, linked
after `ui.css`.

```css
/* variations/harbor.css */
:root {
  --color-ink: light-dark(#1b1a17, #f2efe8);
  --color-cloud: light-dark(#f7f4ee, #12110f);
  --radius-md: 4px;
}
```

```html
<link rel="stylesheet" href="/ui/ui.css" /> <link rel="stylesheet" href="/variations/harbor.css" />
```

Rules for a variation:

- Tokens only. If a look cannot be reached by changing tokens, that is a new component or a change
  to Base, not a variation.
- Give every color both values with `light-dark()`, so light and dark still come for free.
- Keep text readable: ink on cloud, and the soft and faint inks on cloud and on milk, must stay at a
  contrast of 4.5 to 1 or better.
- Base has two colors. A variation chooses its own two; it does not add a third.
- Keep the file outside the `ui/` folder, with the project's own styles, so that upgrading the
  system never touches it.

Designs that others have made are in the garden, at https://oinam.dev/garden/, and as data at
https://oinam.dev/garden/variations.json. To use one, download its stylesheet from
`https://oinam.dev/garden/<file>` into the project, link it after `ui.css`, and link the fonts it
lists before it. To send one of your own, see "When something is missing".

## Fonts

Base uses the fonts already on the reader's device, so it downloads none. That is the fastest
choice, and it means the page looks a little different on each platform.

For the same look everywhere, the system carries four open fonts. They are served from the
project's own copy, never from another site. To use one, link its stylesheet after `ui.css`; it
declares the font and points the right token at it.

| Stylesheet               | Font           | Becomes                      |
| ------------------------ | -------------- | ---------------------------- |
| `fonts/geist.css`        | Geist          | The text, `--font-sans`      |
| `fonts/inter.css`        | Inter          | The text, `--font-sans`      |
| `fonts/source-serif.css` | Source Serif 4 | The headings, `--font-serif` |
| `fonts/geist-mono.css`   | Geist Mono     | The code, `--font-mono`      |

```html
<link rel="stylesheet" href="/ui/ui.css" />
<link rel="stylesheet" href="/ui/fonts/geist.css" />
<link rel="stylesheet" href="/ui/fonts/source-serif.css" />
```

- Link one text font, not both. Each font is one variable file of 25 to 50 KB that holds every
  weight, and the browser fetches it only if the page uses it.
- Headings are set in `--font-heading`, which is the serif, and everything else in `--font-body`,
  which is the sans. To set headings in the text font, put `--font-heading: var(--font-sans);` in
  the variation.
- All four are under the SIL Open Font License. Each license is beside its font, and goes wherever
  the font goes.
- To add another font, follow the same pattern in the project's own files: a `.woff2` the project
  serves itself, an `@font-face` rule, and the token. Do not link a font from another site.

To try these on every component at once, see https://oinam.dev/play/.

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

### Avatar

`<o-avatar>` is a small round picture of someone, or their initials when there is no picture. `size` takes `small` or `large`.

```html
<o-avatar><img src="/people/asha.jpg" alt="Asha Rao" /></o-avatar>
<o-avatar size="large" role="img" aria-label="Asha Rao">AR</o-avatar>
```

With initials, give it `role="img"` and an `aria-label` with the full name.

### Item

`<o-item>` is one row in a list of things: something to recognize it by, a `<div>` with a title and a line under it, and an action at the end. Rows that follow one another are ruled apart.

```html
<div>
  <o-item>
    <o-avatar role="img" aria-label="Asha Rao">AR</o-avatar>
    <div>
      <strong>Asha Rao</strong>
      <p>Harbor master</p>
    </div>
    <button class="button" data-variant="outline" data-size="small" type="button">Call</button>
  </o-item>
  <o-item>
    <o-avatar role="img" aria-label="Tomas Lind">TL</o-avatar>
    <div>
      <strong>Tomas Lind</strong>
      <p>Night watch</p>
    </div>
    <button class="button" data-variant="outline" data-size="small" type="button">Call</button>
  </o-item>
</div>
```

### Empty

`<o-empty>` stands where content will be once there is some. Say what is missing, and offer the one thing to do about it.

```html
<o-empty>
  <h3>No bookings yet</h3>
  <p>When a boat books a berth, it shows up here.</p>
  <button class="button" type="button">Book a berth</button>
</o-empty>
```

### Skeleton

`<o-skeleton>` holds the place of something that is still loading. It is a line of text by default; `shape` takes `circle` or `block`.

```html
<o-stack gap="2" aria-busy="true">
  <o-skeleton></o-skeleton>
  <o-skeleton></o-skeleton>
  <o-skeleton shape="block"></o-skeleton>
</o-stack>
```

Put `aria-busy="true"` on the container while it loads, and remove it when the content arrives. Set a width in the page's own styles if a line should be shorter than its container.

### Spinner

`<o-spinner>` says that something is under way. It takes the size of the text around it.

```html
<o-row>
  <o-spinner role="status" aria-label="Loading the tide table"></o-spinner>
  <span>Loading the tide table</span>
</o-row>
```

Give it `role="status"` and an `aria-label` that names what is happening. Inside a button, use `aria-busy="true"` on the button instead.

### Progress

`class="progress"` on a `<progress>`, which already knows how far along it is and tells a screen reader so.

```html
<o-stack gap="2">
  <label for="progress-upload">Uploading the chart</label>
  <progress class="progress" id="progress-upload" value="40" max="100">40%</progress>
</o-stack>
```

### Ratio

`<o-ratio>` keeps a picture, a video, or a frame to a fixed shape, and crops it to fit. It is 16 by 9 unless `ratio` says `4/3`, `1/1`, or `21/9`.

```html
<o-ratio ratio="4/3">
  <img src="/harbor.jpg" alt="The harbor at low water" />
</o-ratio>
```

### Scroll

`<o-scroll>` is a frame for something too long to show at once. It scrolls inside, with a thin bar, so the page keeps its length.

```html
<o-scroll tabindex="0" role="group" aria-label="Arrivals this week">
  <p>...</p>
</o-scroll>
```

Give it `tabindex="0"`, `role="group"`, and an `aria-label`, so the keyboard can reach it and scroll. It is 16rem tall at most; set `--scroll` on it in the page's styles for another height.

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

### Button group

`<o-button-group>` joins buttons that belong together into one piece. It suits outline buttons best.

```html
<o-button-group role="group" aria-label="Zoom">
  <button class="button" data-variant="outline" type="button">Out</button>
  <button class="button" data-variant="outline" type="button">Reset</button>
  <button class="button" data-variant="outline" type="button">In</button>
</o-button-group>
```

Give it `role="group"` and an `aria-label` that says what the buttons have in common.

### Input group

`<o-input-group>` puts something before or after a field, inside its frame: a `<span>` for a unit or a prefix, or a small button.

```html
<o-stack>
  <o-field>
    <label for="input-group-length">Length</label>
    <o-input-group>
      <input class="input" id="input-group-length" type="number" inputmode="decimal" />
      <span>meters</span>
    </o-input-group>
  </o-field>
  <o-field>
    <label for="input-group-site">Website</label>
    <o-input-group>
      <span>https://</span>
      <input class="input" id="input-group-site" type="text" />
      <button class="button" data-size="small" type="button">Check</button>
    </o-input-group>
  </o-field>
</o-stack>
```

It goes where the `.input` would go, inside an `<o-field>`.

### Slider

`class="slider"` on an `<input type="range">`, which already works with the keyboard and with touch.

```html
<o-field>
  <label for="slider-draft">Draft, in meters</label>
  <input class="slider" id="slider-draft" type="range" min="0" max="5" step="0.1" value="1.8" />
</o-field>
```

### Toggle

A toggle is a button that stays pressed. It is a checkbox underneath, so it needs no script and sends its value with a form: `class="toggle"` on the `<label>` around the `<input>`. `<o-toggle-group>` sets several side by side in one frame; with radio buttons of one name inside, only one can be pressed at a time.

```html
<o-row gap="6">
  <label class="toggle"><input type="checkbox" checked /> Shore power</label>
  <o-toggle-group role="group" aria-label="View">
    <label class="toggle"><input type="radio" name="toggle-view" checked /> List</label>
    <label class="toggle"><input type="radio" name="toggle-view" /> Map</label>
    <label class="toggle"><input type="radio" name="toggle-view" /> Tides</label>
  </o-toggle-group>
</o-row>
```

## Navigation

### Breadcrumb

`class="breadcrumb"` on the `<nav>` around an ordered list of links: where this page sits, from the top down. The last item is the page itself, and is not a link.

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/ui/">Components</a></li>
    <li aria-current="page">Breadcrumb</li>
  </ol>
</nav>
```

### Pagination

`class="pagination"` on the `<nav>` around a list of page links. The page being shown has `aria-current="page"`.

```html
<nav class="pagination" aria-label="Pages">
  <ul>
    <li><a href="?page=1">Previous</a></li>
    <li><a href="?page=1">1</a></li>
    <li><a href="?page=2" aria-current="page">2</a></li>
    <li><a href="?page=3">3</a></li>
    <li><a href="?page=3">Next</a></li>
  </ul>
</nav>
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

`data-side` takes `right`, `left`, or `bottom`, and makes it a drawer: a panel that slides in from
that edge, for a form or a set of details beside the page.

```html
<dialog
  class="dialog"
  id="details"
  data-side="right"
  aria-labelledby="details-title"
  closedby="any"
>
  <h2 id="details-title">Berth 12</h2>
  <p>East quay, deep water.</p>
</dialog>
```

For a question that must be answered, give the dialog `role="alertdialog"` and leave off `closedby`,
so that only its buttons can close it.

### Popover

`class="popover"` on any element with the `popover` attribute. The browser opens it from the button that names it with `popovertarget`, closes it on Escape or a click elsewhere, and keeps it above everything. There is no script to write.

```html
<button class="button" data-variant="outline" type="button" popovertarget="popover-hours">
  Office hours
</button>

<div class="popover" id="popover-hours" popover>
  <strong>Office hours</strong>
  <p>Eight to five, every day but Sunday.</p>
</div>
```

It opens under its button, and moves above or to the other side when there is no room. In a browser that cannot place it by its button, it opens in the middle of the page. Use it in place of a card that appears on hover, which touch cannot reach.

### Menu (needs script)

`<o-menu>` is a button and the short list of actions it opens. The list is a popover of plain `<button>` and `<a>` elements, with `<hr>` between groups. The arrow keys move between items, and choosing one closes the list. Without the script, Tab still reaches every item.

```html
<o-menu>
  <button class="button" data-variant="outline" type="button" popovertarget="menu-berth">
    Berth 12
  </button>
  <div class="popover" id="menu-berth" popover>
    <button type="button">Rename</button>
    <a href="#menu">Open</a>
    <hr />
    <button type="button" disabled>Release</button>
  </div>
</o-menu>
```

With the `context` attribute, the list opens where the pointer is on a right click anywhere inside the element, and needs no button: `<o-menu context>` around the region, with the popover inside it.

### Tooltip

`<o-tooltip>` shows a few words about a control when the pointer is over it or the keyboard is on it. Inside go the control and a `<span role="tooltip">`, tied together with `aria-describedby`.

```html
<o-tooltip>
  <button class="button" data-variant="outline" type="button" aria-describedby="tooltip-release">
    Release
  </button>
  <span role="tooltip" id="tooltip-release">Frees the berth for the next boat</span>
</o-tooltip>
```

Keep it to a hint. Touch cannot reach a tooltip, so anything a person must read or press belongs on the page or in a popover.

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

### Toast (needs script)

`<o-toast>` is where brief messages appear, in a corner, and go away again. A button with `data-toast` shows its message when pressed, with no script of your own.

```html
<button
  class="button"
  data-variant="outline"
  type="button"
  data-toast="Berth 12 is yours until Friday"
>
  Book the berth
</button>
```

From script: `import { toast } from "/ui/toast.js"`, then `toast("Saved")`. A message stays for six seconds or until dismissed, and is announced to screen readers without taking the focus. A toast is for news that needs no answer; anything a person must act on belongs in the page or in a dialog.

## When something is missing

There is no combobox, date picker, or chart yet, and a real project will find other gaps. When
a page needs something the system does not have:

1. **Build it in the project, by the same rules.** A native element with a class where one does the
   job (`popover`, `<details>`, and `<dialog>` cover a great deal), a custom element where none
   does, tokens for every value, and script only as an enhancement. Name the project's own elements
   and classes with a prefix of the project's own, not `o-`, so that a later version of the system
   cannot collide with them. Keep the files outside `ui/`.
2. **Send it back.** The system grows from what projects needed. Write up what the page needed,
   where, and the markup and CSS that answered it, as a "design need" at
   https://github.com/oinam/oinam.dev/issues/new?template=design-need.md. If you are an agent,
   write this up and give it to the project's owner to send; do not post it yourself.
3. **Send a design.** A variation that others could use belongs in the garden. The steps are in
   https://github.com/oinam/oinam.dev/blob/main/CONTRIBUTING.md, under "Send a design".
