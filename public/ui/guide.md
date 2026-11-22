# Oinam UI v0.5.0

A design system in plain HTML, CSS, and JavaScript. No framework, no build step, and no
dependencies. This page is the core of it, written for an AI agent to read once and then design
with: how to take it, the rules, and the list of components. Each component then has a short page
of its own, read when it is used. It exists so that the first draft of a page does not look like every other page an AI has
made.

If you were sent to https://oinam.dev/ and told to build with it, this is the page you were sent
for.

- Live examples, for people: https://oinam.dev/ui/
- The same as data: https://oinam.dev/ui/registry.json, and what each element accepts:
  https://oinam.dev/ui/contract.json
- Why each rule is the way it is: https://oinam.dev/ui/why.md
- What changed in each version: https://oinam.dev/ui/CHANGELOG.md
- Source: https://github.com/oinam/oinam.dev/tree/main/public/ui

## Install

Take a copy. The system is meant to live inside your project, not to be linked from oinam.dev.
(To try it on a page without a copy, see "Linking instead", below.)

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

### Linking instead

If you are an agent building a project, take a copy as above; this is not for you. Linking is for a
person trying the system on a page, or for a demo that will never be upgraded.

Every version is also served, frozen, at an address of its own, and any site may link it. The files
there never change, so a page that links them keeps its look whatever a later version renames.

```html
<link rel="stylesheet" href="https://oinam.dev/ui/releases/0.5.0/ui.css" />
<script src="https://oinam.dev/ui/releases/0.5.0/theme-init.js"></script>
<script type="module" src="https://oinam.dev/ui/releases/0.5.0/ui.js"></script>
```

- Only the files a page loads are there: the stylesheets, the scripts, and the fonts. The guide,
  the tools, and the patterns are read from https://oinam.dev/ui/.
- The released versions are the headings of https://oinam.dev/ui/CHANGELOG.md, from 0.5.0 on.
- https://oinam.dev/ui/ui.css also works from any site, but it is always the newest version. When
  a version renames a class or a token, a page linked there changes without warning. Link a release.

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

Two more ways to bring the system to an agent, for hosts that support them. Both use the project's
own copy, so they work offline and match the version the project has.

- **A skill.** `ui/skill/SKILL.md` is the steps on this page as a skill: read, write, lint, look.
  For Claude Code, copy it to `.claude/skills/oinam-ui/SKILL.md` in the project.
- **A Model Context Protocol server.** `ui/tools/mcp.js` lets an agent ask for one thing at a time:
  the guide, one component's page, one pattern, or a check of what it wrote. For Claude Code, put
  this in `.mcp.json` at the root of the project:

```json
{ "mcpServers": { "oinam-ui": { "command": "node", "args": ["ui/tools/mcp.js"] } } }
```

## How it works

Three rules cover the whole system.

1. **A native element that does the job gets a class.** A button is a `<button class="button">`.
   A text field is an `<input class="input">`. The classes are `.button`, `.input`, `.choice`, `.toggle`, `.slider`, `.progress`,
   `.dialog`, `.popover`, `.breadcrumb`, `.pagination`, `.facts`, `.eyebrow`, and `.lede`.button`, `.input`, `.choice`,
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

What each rule protects, and when it may be bent, is in `why.md`. Read that before you break one,
or when the owner asks you to.

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
- **No inline scripts.** No `<script>` with code written into the page, and no `onclick` or other
  handler in an attribute. Put script in a file and link it. A page can then forbid everything it
  did not link, which is the strongest protection it has.
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

## Patterns: whole pages to follow

The components are parts. A page is a composition, and that is where a first draft goes generic.
So the system carries whole pages, built from the components and nothing else, each one opening
with a comment that says why it is laid out the way it is. Before composing a page, read the
pattern nearest to it.

| File                      | Pattern                | What it shows                                                                                                |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `patterns/form.html`      | A form                 | One narrow column, fields grouped under names, help under each field, and one button that says what it does. |
| `patterns/table.html`     | A table view           | Many like things as a table, with one main action, a filter, a status, and each row's actions in a menu.     |
| `patterns/settings.html`  | Settings               | Rows with a name on one side and a control on the other, and a dangerous action that asks first.             |
| `patterns/list.html`      | A list, empty and full | The same list with boats expected, with none, and while it loads.                                            |
| `patterns/article.html`   | An article             | Writing in one column: a date, a title, a lede, plain prose, a table, and one thing not to miss.             |
| `patterns/dashboard.html` | A dashboard            | A sentence that says what matters now, what needs a decision, and the figures beside it. No charts.          |

They are in `ui/patterns/` in the project's copy, and live at https://oinam.dev/ui/patterns/. Their
own stylesheet, `patterns/patterns.css`, is what a project's own stylesheet looks like: short, and
tokens only. Take the structure of a pattern, not its words; the harbor office in them is made up.

## Check your work

Before you hand a page back, run the linter on it. It needs Node and nothing else.

```sh
node ui/tools/lint.js path/to/page.html path/to/styles.css
node ui/tools/lint.js site/
```

It reads the page as text and checks what a program can check:

- every `o-` element, attribute, and value is one the system has, and every class of the system is
  on an element it is for (`contract.json` is the list it reads);
- an element has the part it is built around, and no card sits inside a card;
- every control, button, and picture has a name;
- ids are not repeated, and nothing points at an id that is not there;
- headings do not skip a level, and there is one `h1`;
- no `style` attribute, no script written into the page, no color or font written out raw, no gradient, no forced capitals, no
  `!important`, no emoji;
- no two solid buttons side by side;
- the system is not loaded from oinam.dev.

It prints the file, the line, the rule, and what to do, and exits with 1 if it found anything. Mend
what it reports and run it again until it is clean. `--json` gives the findings as data, and
`--rules` lists every rule with its reason.

If a rule is wrong for one line, set it aside there and say why. The reason is required.

```html
<!-- lint-allow two-solid-buttons: yes and no are equal choices here -->
```

A clean result means the page is well formed, not that it looks right. The linter never runs the
page. Look at it too.

### See it

`see.js` opens the page in a browser already on the machine and saves a picture of the whole page at
320, 768, and 1440 wide, in light and in dark. It needs Node 22 and Chrome, Chromium, Edge, or
Brave, and installs nothing.

```sh
node ui/tools/see.js http://localhost:8788/pricing/
node ui/tools/see.js --root site pricing/index.html
```

Give it an address, or a file with `--root`, which serves that folder for as long as the pictures
take. The pictures go in `seen/`; `--out`, `--widths`, and `--themes` change that. It also reports
what a picture can hide: a page that runs off the side at some width, and any error the page threw,
and it exits with 1 if it found one.

Then open the pictures and read them the way the owner will. Ask the questions under "Before you
hand it back, look at it". Do not commit the `seen/` folder.

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

All of them are custom properties on `:root`, defined in `tokens.css`. The same values are in
`tokens.json`, in the Design Tokens format, for a tool that cannot read CSS; a page uses the CSS.

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

## Components

Each component has a page of its own, with its markup, its attributes, and what to watch for. Read
the page of a component before you use it for the first time; do not guess at its markup. The pages
are in `ui/components/` in the project's copy, and at `https://oinam.dev/ui/components/<name>.md`.
`contract.json` has the same attributes and values as data.

The four layout elements are in every page, so here they are in brief:

- `<o-wrap>` centers the page and keeps it off the edges. `narrow` is for a page of reading.
- `<o-stack>` is a column. `gap` takes `1`, `2`, `3`, `4`, `6`, `8`, `12`, or `16`; `align` takes
  `start` or `center`.
- `<o-row>` is a row that wraps. `gap` as above; `justify` takes `between`, `center`, or `end`;
  `align` takes `start` or `baseline`.
- `<o-grid>` is equal columns, as many as fit. `gap` as above; `min` takes `small` or `large`.

| Component         | Use                             | What it is                                                                     | Its page                     |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| Wrap              | `<o-wrap>`                      | Centers the page content and keeps it off the edges.                           | `components/wrap.md`         |
| Stack             | `<o-stack>`                     | A column. Children sit one under the other, a gap apart.                       | `components/stack.md`        |
| Row               | `<o-row>`                       | A row that wraps. Children sit side by side, a gap apart.                      | `components/row.md`          |
| Grid              | `<o-grid>`                      | Equal columns, as many as fit, with no breakpoints.                            | `components/grid.md`         |
| Text              | `.eyebrow, .lede`               | A small label above a heading, and an opening paragraph a size up.             | `components/text.md`         |
| Prose             | `<o-prose>`                     | A run of writing. Plain headings, paragraphs, and lists get their rhythm.      | `components/prose.md`        |
| Card              | `<o-card>`                      | Groups related things on a raised surface.                                     | `components/card.md`         |
| Badge             | `<o-badge>`                     | A small label: a status, a count, a "new".                                     | `components/badge.md`        |
| Alert             | `<o-alert>`                     | Sets a message apart: a note, a warning, or danger.                            | `components/alert.md`        |
| Table             | `<o-table>`                     | Frames a plain table and lets a wide one scroll sideways.                      | `components/table.md`        |
| Facts             | `.facts`                        | A list of names and their values, each pair on a line, ruled apart.            | `components/facts.md`        |
| Avatar            | `<o-avatar>`                    | A small round picture of someone, or their initials.                           | `components/avatar.md`       |
| Item              | `<o-item>`                      | One row in a list: something to know it by, a title and a line, and an action. | `components/item.md`         |
| Empty             | `<o-empty>`                     | Stands where content will be once there is some.                               | `components/empty.md`        |
| Skeleton          | `<o-skeleton>`                  | Holds the place of something that is still loading.                            | `components/skeleton.md`     |
| Spinner           | `<o-spinner>`                   | Says that something is under way.                                              | `components/spinner.md`      |
| Progress          | `.progress`                     | How far along something is, on a <progress>.                                   | `components/progress.md`     |
| Ratio             | `<o-ratio>`                     | Keeps a picture, a video, or a frame to a fixed shape.                         | `components/ratio.md`        |
| Scroll            | `<o-scroll>`                    | A frame for something too long to show at once.                                | `components/scroll.md`       |
| Button            | `.button`                       | A button, on a <button> or an <a>.                                             | `components/button.md`       |
| Field             | `<o-field>, .input`             | A label, its control, and a line of help, kept together.                       | `components/field.md`        |
| Choice and switch | `.choice, input[role="switch"]` | A checkbox, a radio button, or a switch, with its label.                       | `components/choice.md`       |
| Button group      | `<o-button-group>`              | Joins buttons that belong together into one piece.                             | `components/button-group.md` |
| Input group       | `<o-input-group>`               | Puts a unit, a prefix, or a button inside the frame of a field.                | `components/input-group.md`  |
| Slider            | `.slider`                       | A value chosen by sliding, on an <input type="range">.                         | `components/slider.md`       |
| Toggle            | `.toggle, <o-toggle-group>`     | A button that stays pressed, alone or in a group.                              | `components/toggle.md`       |
| Breadcrumb        | `.breadcrumb`                   | Where this page sits, from the top down.                                       | `components/breadcrumb.md`   |
| Pagination        | `.pagination`                   | Links to the pages of a long list.                                             | `components/pagination.md`   |
| Accordion         | `<o-accordion>`                 | A set of <details> that open and close.                                        | `components/accordion.md`    |
| Tabs              | `<o-tabs>`                      | Turns a run of sections into tabs.                                             | `components/tabs.md`         |
| Dialog            | `.dialog`                       | A modal or a drawer, on a <dialog>, opened and closed without script.          | `components/dialog.md`       |
| Popover           | `.popover`                      | A small panel that opens under the button that names it.                       | `components/popover.md`      |
| Menu              | `<o-menu>`                      | A button and the short list of actions it opens.                               | `components/menu.md`         |
| Tooltip           | `<o-tooltip>`                   | A few words about a control, on hover or focus.                                | `components/tooltip.md`      |
| Copy              | `<o-copy>`                      | Adds a copy button to a block of code.                                         | `components/copy.md`         |
| Theme             | `<o-theme>`                     | A light and dark toggle that remembers the choice.                             | `components/theme.md`        |
| Example           | `<o-example>`                   | Shows markup at work and prints its source beside it.                          | `components/example.md`      |
| Toast             | `<o-toast>`                     | Brief messages that appear in a corner and go away again.                      | `components/toast.md`        |

Marked "needs script" on their pages: Tabs, Menu, Copy, Theme, Toast, and Example. Everything else
is CSS alone.

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
