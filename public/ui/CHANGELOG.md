# Changelog

Every version of Oinam UI, newest first. The version a project has is the `version` in its own copy
of `registry.json`.

Each entry says what changed and, under "What to do", what a project that upgrades must change in
its own pages. An agent upgrading a project reads every entry above the version the project had,
oldest first, and does each "What to do" in turn. The steps are in `guide.md`, under "Upgrade".

The numbers mean what they say:

- The last number changes for a fix. Nothing in a page needs to change.
- The middle number changes when something is added. Nothing in a page needs to change.
- The first number changes when a page that worked may stop working: a class, an element, an
  attribute, or a token was renamed or removed. Before 1.0.0, the middle number does this job too.

## 0.10.1

2026-11-27

Every file says where it came from. A stylesheet or a script taken into a project travels on its
own, and a reader who finds it there should be able to find the rest.

- Every stylesheet and script in `ui/`, the fonts' stylesheets, the patterns' stylesheet, and the
  tools now carry one line in their opening comment: "From Oinam UI at https://oinam.dev/ui/, under
  the MIT license." A test holds every file to it.

### What to do

Nothing in a page has to change. Running the installer again brings the new line into every file.
A file the project has changed is kept as it is, with the new one beside it as `.new`; add the
line by hand there, or leave it.

- A page that links a release may change `/ui/releases/0.10.0/` to `/ui/releases/0.10.1/`.

## 0.10.0

2026-11-27

One prefix for everything the system names. Every custom element is renamed from `o-` to `onm-`,
and every class takes the same prefix: `<o-card>` is now `<onm-card>`, and `class="button"` is now
`class="onm-button"`. A one-letter prefix, and classes with no prefix at all, were likely to clash
with another library's elements or a site's own `.button` and `.input`. `onm-` is the system's
alone, and one prefix on both makes the system's names plain to see in a page.

What is not renamed: the attributes and their values (`gap`, `data-variant`, `tone`, and the
rest), the tokens (`--color-ink` and the others), the cascade layers, the file names, and the
component names in `registry.json` and the addresses of their pages. `classless.css` selects no
class, so a classless page is unchanged.

- Every stylesheet, script, and component page, `guide.md`, `why.md`, `adopt.md`, the skill, the
  patterns, `contract.json`, and `registry.json` use the new names.
- `tools/lint.js` knows the new names. It reports an `o-` element as `unknown-element`, and a class
  of the old names is no longer one of the system's, so it is not checked.
- The id `tabs.js` gives a set of tabs without one starts `onm-tabs-`.

### What to do

A page that worked with 0.9.0 does not work with 0.10.0 until every name below is changed: its
elements lose their look and, for the scripted ones, their behavior. Change them all, in markup, in
the project's own stylesheets and scripts, and in any `querySelector`, `closest`, `matches`, or
`classList` call. Then run `tools/lint.js` over every page and look at each one.

Elements, in opening and closing tags and in selectors:

- `<o-accordion>` is now `<onm-accordion>`.
- `<o-alert>` is now `<onm-alert>`.
- `<o-avatar>` is now `<onm-avatar>`.
- `<o-badge>` is now `<onm-badge>`.
- `<o-button-group>` is now `<onm-button-group>`.
- `<o-card>` is now `<onm-card>`.
- `<o-copy>` is now `<onm-copy>`.
- `<o-empty>` is now `<onm-empty>`.
- `<o-example>` is now `<onm-example>`.
- `<o-field>` is now `<onm-field>`.
- `<o-grid>` is now `<onm-grid>`.
- `<o-input-group>` is now `<onm-input-group>`.
- `<o-item>` is now `<onm-item>`.
- `<o-menu>` is now `<onm-menu>`.
- `<o-prose>` is now `<onm-prose>`.
- `<o-ratio>` is now `<onm-ratio>`.
- `<o-row>` is now `<onm-row>`.
- `<o-scroll>` is now `<onm-scroll>`.
- `<o-skeleton>` is now `<onm-skeleton>`.
- `<o-spinner>` is now `<onm-spinner>`.
- `<o-stack>` is now `<onm-stack>`.
- `<o-table>` is now `<onm-table>`.
- `<o-tabs>` is now `<onm-tabs>`.
- `<o-theme>` is now `<onm-theme>`.
- `<o-toast>` is now `<onm-toast>`.
- `<o-toggle-group>` is now `<onm-toggle-group>`.
- `<o-tooltip>` is now `<onm-tooltip>`.
- `<o-wrap>` is now `<onm-wrap>`.

Classes, in `class` attributes and in selectors (`.button` becomes `.onm-button`):

- `class="breadcrumb"` is now `class="onm-breadcrumb"`.
- `class="button"` is now `class="onm-button"`.
- `class="choice"` is now `class="onm-choice"`.
- `class="dialog"` is now `class="onm-dialog"`.
- `class="eyebrow"` is now `class="onm-eyebrow"`.
- `class="facts"` is now `class="onm-facts"`.
- `class="input"` is now `class="onm-input"`.
- `class="lede"` is now `class="onm-lede"`.
- `class="pagination"` is now `class="onm-pagination"`.
- `class="popover"` is now `class="onm-popover"`.
- `class="progress"` is now `class="onm-progress"`.
- `class="slider"` is now `class="onm-slider"`.
- `class="toggle"` is now `class="onm-toggle"`.

- A project that built elements of its own under the system's rules keeps its own prefix; nothing
  of it changes.
- A page that links a release changes `/ui/releases/0.9.0/` to `/ui/releases/0.10.0/`, and its
  names as above.

## 0.9.0

2026-11-27

A way in without classes. A page of plain HTML can now take the system with one link, and no class
or custom element in it. Nothing is renamed or removed, and `ui.css` is unchanged.

- `classless.css`: a stylesheet that stands in for `ui.css` on a page with no classes. It imports
  the same `tokens.css` and `base.css`, then dresses the bare elements as their components look: a
  submit `<button>` as the solid `.button`, any other button as the outline, `<input>`,
  `<textarea>`, and `<select>` as `.input`, a `<label>` around a checkbox as `.choice`, a `<table>`
  as `<o-table>`, a run of `<details>` as `<o-accordion>`, and `<dialog>` as `.dialog`. The body
  becomes one column at a measure made for reading, and the writing in it gets the rhythm of
  `<o-prose>`. An element with a class of its own is left alone. Its rules sit in a layer named
  `classless`, after `base` and before `layout` and `components`.
- `classless.html`: a page made with that one link and nothing else, at `/ui/classless`.
- `registry.json`: `all.classless` names the sheet, so the installer takes it, and a release
  holds it.
- `why.md`: why this is a separate sheet, and Base still is not classless.

### What to do

Nothing in a page has to change. Running the installer again takes `classless.css` and the new
`registry.json` and `why.md`.

- A page that links `ui.css` keeps it, and does not add `classless.css` after it: the layer that
  comes last in the page wins, so its bare buttons and fields would be dressed over the
  components. The other way round works. A classless page that grows into the components links
  `ui.css` after `classless.css`, and the components win wherever the two speak.
- A project with pages of plain HTML that it styled by hand to look like the system, such as a
  readme rendered to a page or a quick form, may link `classless.css` instead and delete the rules
  it wrote, after looking at the page in light and in dark.
- A page that links a release may change `/ui/releases/0.8.0/` to `/ui/releases/0.9.0/`.

## 0.8.0

2026-11-24

Color for kinds and for the one action. Color now has three jobs, and only three: a status (the
tones of 0.7.0), a kind (six numbered hues), and the one main action (the accent). Base still has
two colors for everything else, and nothing is renamed or removed.

- `<o-badge hue="1">` to `hue="6"`: a badge that names a kind of thing among others, such as the
  topics on each item of a listing, may take a hue. A page gives each kind its own number and keeps
  to it. A kind badge has squarer corners than a status badge, so the two are told apart in one
  row.
- `<button class="button" data-variant="accent">`: the solid button in color, for the one main
  action of a group, when it must stand apart from the outline and ghost buttons beside it. It
  takes the solid button's place. Its hover leans toward ink instead of fading.
- `tokens.css` and `tokens.json`: fourteen new tokens. `--color-hue-1` to `--color-hue-6`, each
  with a `-fill`, at 7 to 1 or better on its fill in light and dark; and `--color-accent`, at 3 to
  1 or better against cloud and milk, with `--color-accent-text` for its label, at 4.5 to 1 or
  better on it.
- `tools/lint.js`: an accent button counts as solid for `two-solid-buttons`, and two new findings:
  `wordless-hue`, a hued badge with no words, and `hue-and-tone`, a badge with both.
- `guide.md` and `why.md`: the color rule is now one rule with three jobs, and what color is still
  not for.

### What to do

Nothing in a page has to change. Replace `tokens.css`, `tokens.json`, `badge.css`, `button.css`,
`ui.css` (its header names the version), `tools/lint.js`, `guide.md`, `why.md`, `contract.json`,
`components/badge.md`, `components/button.md`, and `registry.json`; running the installer again does
all of it.

- A page whose badges name kinds of things, such as topics or categories, in plain outlined badges
  may give each kind a hue: `<o-badge hue="1">Design</o-badge>`. Keep one number per kind across
  the project, and keep `tone` for statuses. Never put both on one badge.
- A group whose main action must stand apart may change its solid button,
  `<button class="button">`, to `<button class="button" data-variant="accent">`. Leave the others
  outline or ghost. Do not make an accent of a button beside another solid one; the linter reports
  it.
- A project that gave its main action or its tags colors of its own may use these instead, and
  delete its own tokens and the page rules that set them.
- A variation that already declares a token named `--color-accent`, `--color-accent-text`, or
  `--color-hue-1` to `--color-hue-6` or their `-fill`s, now sets the system's. Keep each hue at 4.5
  to 1 or better on its fill, and the accent at 3 to 1 against the variation's cloud and milk with
  its label at 4.5 to 1 on it, in light and in dark, or rename it.
- A page that links a release may change `/ui/releases/0.7.0/` to `/ui/releases/0.8.0/`.

## 0.7.0

2026-11-23

Status tones: the one place the system uses a hue, for a status read at a glance, on badges and
alerts. Base still has two colors, and nothing is renamed or removed.

- `<o-badge tone="success|warning|danger|info">`: a badge whose status sits among others like it,
  such as Verified, Unverified, and Failed on each row of a report, may take a tone. The word still
  says it. `variant="solid"` turns a tone over.
- `<o-alert tone="success|warning|danger|info">`: an alert may take the tone of what it says. Its
  weight still carries the meaning, so `variant="warning"` takes `tone="warning"`, and
  `variant="danger"` takes `tone="danger"`, which turns the tone over.
- `tokens.css` and `tokens.json`: eight new tokens, `--color-success`, `--color-warning`,
  `--color-danger`, and `--color-info`, each with a `-fill` to sit on, each with a light and a dark
  value. A status color is only ever set on its own fill, at 7 to 1 or better.
- `tools/lint.js`: two new findings, `wordless-tone` for a toned badge with no words, and
  `tone-disagrees` for an alert whose tone and variant say different things.
- `guide.md` and `why.md`: when a hue is allowed, and why the two-color rule bends here and nowhere
  else.

### What to do

Nothing in a page has to change. Replace `tokens.css`, `tokens.json`, `badge.css`, `ui.css` (its
header names the version), `alert.css`, `tools/lint.js`, `guide.md`, `why.md`, `contract.json`,
`components/badge.md`, `components/alert.md`, and `registry.json`; running the installer again does all of it.

- A project that gave its statuses colors of its own may use the tones instead: set
  `tone="success"`, `tone="warning"`, or `tone="danger"` on the `<o-badge>`, and delete the
  project's own status tokens and the page rules that set them. For example, a variation's
  `--ink-verified` and `--ink-verified-fill` become `--color-success` and `--color-success-fill`,
  and `o-badge.ink-stamp[data-stamp="verified"]` becomes `<o-badge tone="success">`; unverified is
  `warning`, and failed is `danger`.
- A variation that already declares a token named `--color-success`, `--color-warning`,
  `--color-danger`, or `--color-info`, or one of their `-fill`s, now sets the system's. Keep each
  pair at 4.5 to 1 or better, in light and in dark, or rename it.
- A page that links a release may change `/ui/releases/0.6.0/` to `/ui/releases/0.7.0/`.

## 0.6.0

2026-11-22

For sites that already exist: bringing the system into one that has its own styles, build, and
years of pages. Nothing is renamed or removed.

- `adopt.md`: a new document on adopting the system into an existing site: where the copy goes,
  folding it into a Sass or bundler build with its layers, joining the site's tokens, old content,
  and the linter. `guide.md` points to it.
- `install.sh --runtime`: takes only what a page loads, the stylesheets, the scripts, and the
  fonts, for a site whose generator would publish the documents as pages. Run again, the copy stays
  that way; `--full` brings in the rest.
- `<o-theme auto>`: a third state, back to following the system. Without `auto`, it works as
  before.
- `theme.js` and `theme-init.js`: a stored theme other than `light` or `dark`, such as `auto`, now
  follows the system. Before, `theme-init.js` read it as light. Both also set `data-theme-choice`
  on `<html>`: `light`, `dark`, or `auto`.
- `tools/lint.js`:
  - `lint-allow-start <rules>: <reason>` and `lint-allow-end` set rules aside for a region, and
    `all` sets every rule aside there. A region left open, or an end with no start, is a new
    finding, `unclosed-allow`.
  - The code of `theme-init.js`, written into a page as it is, is no longer reported as inline
    script.
  - A style attribute in an SVG now says to use the SVG's own attributes.

### What to do

Nothing in a page has to change. Replace `theme.js`, `theme-init.js`, `tools/lint.js`, `guide.md`,
`why.md`, `contract.json`, `components/theme.md`, `ui.css` (its header names the version), and
`registry.json`, and add `adopt.md`; running the installer again does all of it. If the project
stored its own value under the `theme` key in `localStorage` and relied on anything but `light` or
`dark` meaning light, it now follows the system. A page that links a release may change
`/ui/releases/0.5.0/` to `/ui/releases/0.6.0/`.

## 0.5.0

2026-11-22

Releases to link. Nothing in the components changed.

- Each version from this one on is also served, frozen, at
  `https://oinam.dev/ui/releases/<version>/`: the stylesheets, the scripts, and the fonts, exactly
  as they were released, cached for a year. A page that links a release instead of taking a copy
  keeps its look when a later version renames a class or a token.
- `guide.md`: a new section under Install, "Linking instead", says when to link and how. A project
  an agent builds still takes a copy.

### What to do

Nothing in a page changes. Replace `guide.md`, `why.md`, `ui.css` (its header names the version),
and `registry.json`. A page that links `https://oinam.dev/ui/ui.css` or another file under `/ui/`
directly may change its links to `https://oinam.dev/ui/releases/0.5.0/` with the same file names,
to stop taking new versions unasked.

## 0.4.1

2026-11-22

A fix.

- `<o-copy>`: the Copy button sat a few pixels high beside a single line of code. It now sits on
  the middle of the first line, so a one-line block has it centered, and a longer block has it
  beside the line it starts with.

### What to do

Replace `copy.css` with the new one. Nothing in a page changes.

## 0.4.0

2026-11-21

Tools and documents for agents. Nothing in the components changed.

- `contract.json`: what each element and class accepts, as data: its attributes, their values, what
  it must contain, and where it may not go.
- `tools/lint.js`: a linter for pages built with the system. An agent runs it on what it wrote.
- `patterns/`: six whole pages built from the components, each with a note on why it is laid out
  as it is: a form, a table view, settings, a list empty and full, an article, and a dashboard.
- `.facts`: a list of names and their values, on a `<dl>`. The first eval run found three of five
  agents building it by hand.
- `<o-table>` keeps anything placed absolutely inside it within its own scrolling.
- The guide is half as long. It keeps the rules and a table of the components, and each component
  now has a page of its own in `components/`, read when it is used.
- `tools/mcp.js`: a Model Context Protocol server, so an agent can ask for the guide, one
  component, one pattern, or a lint of what it wrote, from the project's own copy.
- `skill/SKILL.md`: the steps for designing with the system, as a skill.
- `tools/see.js`: pictures of a page at three widths, in light and in dark, from a browser already
  on the machine.

### What to do

Nothing. Everything in this version is an addition, and no page needs to change.

## 0.3.0

2026-11-21

- `tokens.json`: the tokens in the Design Tokens format (2025.10), for tools that cannot read CSS.
  It holds the same values as `tokens.css`, which is still what a page uses.
- `why.md`: what each rule of the system protects, what it costs, and when to think again.
- The Oinam mark on the site is redrawn from its geometry.

### What to do

Nothing. Both files are additions, and no page needs to change. If the project has a variation,
`tokens.json` still describes Base, not the variation.

## 0.2.0

2026-11-21

Eighteen more components, most of them native elements with a class or custom elements styled by
CSS alone.

- Content: `<o-avatar>`, `<o-item>`, `<o-empty>`, `<o-skeleton>`, `<o-spinner>`, `.progress`,
  `<o-ratio>`, `<o-scroll>`.
- Controls: `<o-button-group>`, `<o-input-group>`, `.slider`, `.toggle` and `<o-toggle-group>`.
- Navigation: `.breadcrumb`, `.pagination`.
- Disclosure: `.popover`, `<o-menu>`, `<o-tooltip>`, and drawers, which are a `.dialog` with
  `data-side`.
- Utilities: `<o-toast>`.
- The header of the site shows the version, and the garden opened.

### What to do

Nothing. Everything in this version is an addition, and no page that worked needs to change. If the
project links the files one by one, not through `ui.css` and `ui.js`, the new ones are there to
link when a page uses them.

## 0.1.0

2026-11-21

The first version, and the Base design.

- Tokens for color, type, space, shape, and motion, with light and dark values for every color.
- Layout: `<o-wrap>`, `<o-stack>`, `<o-row>`, `<o-grid>`.
- Content: `.eyebrow`, `.lede`, `<o-prose>`, `<o-card>`, `<o-badge>`, `<o-alert>`, `<o-table>`.
- Controls: `.button`, `<o-field>`, `.input`, `.choice`, and the switch.
- Disclosure: `<o-accordion>`, `<o-tabs>`, `.dialog`.
- Utilities: `<o-copy>`, `<o-theme>`, `<o-example>`.
- Open fonts to opt into, served from the project's own copy: Geist, Inter, Source Serif 4, and
  Geist Mono.
- `install.sh`, to take a copy into a project and to upgrade it later.

### What to do

Nothing. This is where it starts.
