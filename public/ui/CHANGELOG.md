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

## 0.4.0

2026-11-21

Tools and documents for agents. Nothing in the components changed.

- `contract.json`: what each element and class accepts, as data: its attributes, their values, what
  it must contain, and where it may not go.
- `tools/lint.js`: a linter for pages built with the system. An agent runs it on what it wrote.
- `patterns/`: six whole pages built from the components, each with a note on why it is laid out
  as it is: a form, a table view, settings, a list empty and full, an article, and a dashboard.
- `<o-table>` keeps anything placed absolutely inside it within its own scrolling.
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
