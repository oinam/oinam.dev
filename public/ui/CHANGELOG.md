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

## 0.1.0

2026-11-21

The first version, and the Base design.

- Tokens for color, type, space, shape, and motion, with light and dark values for every color.
- Layout: `<o-wrap>`, `<o-stack>`, `<o-row>`, `<o-grid>`.
- Content: `.eyebrow`, `.lede`, `<o-prose>`, `<o-card>`, `<o-badge>`, `<o-alert>`, `<o-table>`.
- Controls: `.button`, `<o-field>`, `.input`, `.choice`, and the switch.
- Disclosure: `<o-accordion>`, `<o-tabs>`, `.dialog`.
- Utilities: `<o-copy>`, `<o-theme>`, `<o-example>`.
- `install.sh`, to take a copy into a project.

### What to do

Nothing. This is where it starts.
