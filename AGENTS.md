# oinam.dev

Instructions for any AI agent working in or pointed at this repository. This file is the canonical
source; tool-specific files (such as `CLAUDE.md`) import it rather than repeat it.

## Purpose

- This is the starting point to hand any AI at the beginning of design and development work.
- Read this file first. It sets the scope, audience, standards, and style that every oinam.dev
  project inherits. A project may add its own rules on top, but not loosen these.

## Scope

- This repository is only for AI: AI agents, agent harnesses, prompts, skills, evals, and the
  tooling around them.
- Anything that is not about AI belongs in another repository.

## Audience

- Primary: personal work, family work, and general Oinam work and projects.
- Later, possibly, the public. Write and build so that opening it up needs no rework: no private
  data, no personal details, and no secrets in the repository.

## Visibility

- GitHub repositories under oinam.dev are public by default.
- Treat everything committed as published. A repository is made private only by explicit choice,
  never by default.
- Every oinam.dev repository carries the GitHub topic `oinam-dev`, so the group can be filtered on
  GitHub. (Topics allow only lowercase letters, numbers, and hyphens, so no dot.) Grouping uses
  topics only; no custom properties.

## Standards

All code meets the highest standard practice for its language and ecosystem. A change is not done
until every point below holds.

- **Linted.** Use the ecosystem's standard linter, configured in the repository, with zero warnings.
- **Formatted.** Use the ecosystem's standard formatter, configured in the repository, so output
  never depends on an editor.
- **Evaluated.** Anything that drives or wraps a model (prompts, agents, skills, harnesses) ships
  with evals that measure whether it does its job, and those evals are run before the change lands.
- **Tested.** Deterministic code ships with a well-written test suite that passes. Bugs get a
  failing test before the fix.
- **Followed.** Lint, format, eval, and test run in CI on every push and pull request; a red check
  blocks the merge. Do not skip, silence, or weaken a check to get a change through.
- **Accessible.** Accessibility is considered from the first decision, in everything built: colors,
  text, layout, motion, and behavior. Meet WCAG 2.2 AA at the least: text at 4.5 to 1 against its
  ground (3 to 1 for large text and for the edges of controls), in light and in dark; type that
  can be enlarged and lines that can be read; everything reachable and visible by keyboard; a name
  for every control and image that carries meaning; nothing told by color, or by hover, alone;
  motion that respects `prefers-reduced-motion`; and content that reads with scripts off. Where a
  program can check one of these, a test or the linter does.
- **Documented.** Each project states how to install, lint, format, test, and run evals in one
  place, and keeps it current.

## Website

The site at https://oinam.dev is the `public/` folder, served as it is by Cloudflare Pages. Every
push to `main` deploys it. How the Cloudflare zone around it is set up, and why, is in
`docs/cloudflare.md`.

- **For AI first.** Agents and AI tools are the readers; people mostly look. Content lives in the
  HTML itself, in semantic markup, and reads the same with scripts off. `public/llms.txt` maps the
  site for language models.
- **One address.** The owner hands an agent the bare address, https://oinam.dev/, and nothing
  more. So the home page must send an agent on to `/ui/guide.md` in plain words, with the full
  address written out. Keep that sentence on the page whatever else changes; a test checks for it.
- **Static.** No build step, no framework, no server code, and no third-party requests. A page is a
  file. Reach for Cloudflare's dynamic features only when a static file cannot do the job.
- **Fast.** System fonts, one stylesheet, and as little script as a page can get by on. Scripts
  enhance; no content waits on them.
- **Open.** No accounts, and nothing behind a sign-in.
- **Crafted.** Write it the way a veteran programmer would at leisure, over a period of time:
  plain, unhurried, and pretty. Comment where a reader would otherwise stumble, say why rather than
  what, and stop there.

Some things are kept by hand, because there is no build step to keep them:

- The header and footer are repeated in every page under `public/`. Change them in all pages
  together.
- A new page is added to `public/search.json` (the search index), `public/sitemap.xml`, and
  `public/llms.txt`.
- A page in the sitemap carries the share tags (Open Graph and the Twitter card), copied from
  another page with its own title, description, and address. A test checks them.

The garden at `/garden/` is one fixed page shown in many designs, after the CSS Zen Garden. A
design is one stylesheet of token values in `public/garden/`, listed in `variations.json` and in
the table on the page. The sample page's markup is the same as the one on Play; change both
together. `CONTRIBUTING.md` says how a design is sent, the tests are the gate, and
`docs/garden-plan.md` is where this is heading.

The colors at `/colors/` are pairs of colors, each three tokens in light and dark, listed in
`public/colors/colors.json`, which is kept by hand. Each also carries an accent, for the one main
action: set in the list, or, where it is not, worked out from the color's ink by the script. Every page and stylesheet in `public/colors/` is
written from that list by `mise run colors`; edit the list, run it, and commit both. A color's
number is its address and never changes; its name follows the number only for reading, and may.
Why, and Oinam's own colors, are in `docs/color-variations.md`.

The Play page at `/play/` lets a person try other fonts, corners, and colors on the components and
take the result away as a variation. What it offers is the `OPTIONS` list in
`public/assets/variation.js`; add a choice there and the page shows it.

The site's own styles and its search are in `public/assets/`. Everything else it wears comes from
the components, which it uses the same way anyone else would.

## Components

`public/ui/` is Oinam UI: the components an agent is pointed at to start designing. Its guide for
agents is `public/ui/guide.md`, served at https://oinam.dev/ui/guide.md. Read that to use the
components; read this to change them.

- **The point of it.** A page designed by an AI with these components should not look like the page
  every AI makes, and the first draft is the one that counts. The components carry the surface;
  `guide.md` carries the judgment, under "Make the first draft look made". Hold a new component, and
  every page of this site, to that section.
- **Plain HTML, CSS, and JavaScript.** No React, no framework of any kind, no build step, and no
  dependencies. Every file runs exactly as it is written. People should be able to read it, learn
  from it, and build their own.
- **Web components are the structure.** Anything HTML has no element for is a custom element with
  an `onm-` name, such as `<onm-card>`. A native element that already does the job takes a class
  instead, such as `<button class="onm-button">`; it is never wrapped or rebuilt.
- **Script is the exception.** Most elements are styled by CSS alone, and the browser's own
  `popover`, `<dialog>`, `<details>`, and form controls are used before any script is written. One that needs behavior wraps
  ordinary HTML in the light DOM, with no shadow DOM, so the page reads correctly before the script
  runs and where it never does.
- **Tokens only.** Every color, size, and shape is a custom property from `tokens.css`, and is
  written a second time in `tokens.json`, in the Design Tokens format; a test holds the two
  together, so change both. Two colors
  do all the work. Color is let in for three jobs only, each with its own tokens: a status (the
  tones), a kind (the numbered hues), and the one main action (the accent). No component adds a
  hue for anything else; why is in `public/ui/why.md`, under "Two colors".
- **Base, and variations of it.** The values in `tokens.css` are Base, the default design. A
  variation is a new look made by changing tokens and nothing else, kept in a stylesheet of its
  own. A change that tokens cannot express is a change to Base, and is made here.
- **Fonts are open, ours to serve, and opt-in.** Base uses the reader's own fonts and downloads
  none. The fonts in `public/ui/fonts/` are under the SIL Open Font License, each with its license
  beside it, a stylesheet that declares it and sets its token, and an entry under `fonts` in
  `registry.json`. No font is ever linked from another site.
- **Each file stands alone.** One component, one stylesheet, and one script if it needs one, each
  opening with a comment that shows the markup. `ui.css` and `ui.js` gather them.
- **Made to be taken.** A project does not link to oinam.dev; it takes a copy with
  `public/ui/install.sh` and owns it. So nothing in a stylesheet or a script may name another
  site, and the installer takes exactly the files `registry.json` names, or with `--runtime`, only
  those a page loads. Bringing the system into a site that already exists is `public/ui/adopt.md`;
  keep it in step with the installer and the linter.
- **Linked, if at all, by release.** Some will link the files instead of taking them, so every file
  under `/ui/` may be loaded from any site, and each version's stylesheets, scripts, and fonts are
  kept frozen in `public/ui/releases/<version>/`. A released folder is never edited, formatted, or
  linted; a fix is a new version. Why, and how a release is cut, is in `docs/linking.md`.

`public/ui/tools/` holds what a project runs with Node, and may use what Node itself provides but
nothing that has to be installed. `tools/lint.js` checks a page against the rules a program can
check, `tools/see.js` takes pictures of one at three widths in light and dark, and `tools/mcp.js`
serves the guide, the components, the patterns, and the linter to an agent over the Model Context
Protocol; this site must pass it, and a rule added to the guide that can be checked is added there.

`public/ui/patterns/` holds whole pages built from the components, for an agent to follow when
composing one. Each is a page by itself, opens with a comment that says why it is laid out as it
is, uses only the system and `patterns.css`, and must pass the linter. A new one is added to
`registry.json`, the guide's table, and the patterns page. The site links to a pattern without
`.html`, because Cloudflare Pages serves it there and redirects the longer address.

The reasons behind these rules are in `public/ui/why.md`. A change to a rule changes that page
too. What is still missing for agents is listed in `docs/ai-native.md`.

A new component is added in each of these places, and the tests fail until it is:

- its files in `public/ui/`, gathered into `ui.css` and, for a script, `ui.js`
- `public/ui/registry.json`, the components as data, and `public/ui/contract.json`, what each
  element and class accepts
- `public/ui/components/<name>.md`, its own page, and a row in the table in `public/ui/guide.md`
- `public/ui/index.html`, as a specimen in an `<onm-example>`, with a link in the contents
- `public/search.json`

A new version is named in each of these places, and the tests fail until they agree:

- `version` in `public/ui/registry.json` and in `package.json`
- the title of `public/ui/guide.md` and of the components page, and the header of `ui.css`
- beside the site title, in the header of every page
- a new entry at the top of `public/ui/CHANGELOG.md`
- the release links in `public/ui/guide.md` and on the components page
- `public/ui/releases/<version>/`, made with `mise run release` once everything above agrees, and
  committed with the release. A file a release holds cannot then change without a new version.

Projects take a copy of the components and upgrade it later, with an agent reading the changelog to
learn what to change. So every changelog entry ends with "What to do", written as instructions to
that agent: each renamed or removed class, element, attribute, or token, by its exact old and new
name. If a page that worked could stop working, the entry must say how to mend it.

The components are used across the owner's projects, and grow from what those projects need. A
need arrives as a "design need" issue, or as a pull request; `CONTRIBUTING.md` says how. When work
in another project shows a gap, write the need up for the owner to send here.

Elements with behavior are tested in `tests/`, against the DOM that `tests/dom.js` sets up.

## Development

[mise](https://mise.jdx.dev) pins the tools and runs every task. `mise.toml` is the one place they
are defined; `package.json` only lists the linters and the formatter.

- `mise trust`, once per clone, then `mise install` to fetch Node, Wrangler, ShellCheck, and shfmt.
- `mise run dev` serves the site the way Cloudflare does, headers and 404 page included, and opens
  it.
- `mise run format` formats everything with Prettier, and the installer with shfmt.
- `mise run lint` lints the scripts (ESLint), the styles (Stylelint), the pages (html-validate),
  and the installer (ShellCheck).
- `mise run test` runs the test suite with Node's test runner.
- `mise run check` runs the format check, the linters, and the tests. CI runs the same task on
  every push and pull request.
- `mise run release` freezes the current version's stylesheets, scripts, and fonts in
  `public/ui/releases/<version>/`. It refuses a version already released.
- `mise run colors` writes the color pages in `public/colors/` from `public/colors/colors.json`.
- `mise run social-card` draws `public/assets/www.oinam.dev.png`, the picture a shared link shows, from
  `docs/social-card.html`, with Chrome. Run it after changing that page, and commit both.

`mise run eval` runs the evals in `evals/`: an agent builds a page from each brief with only the
guide to go on, and the pages are scored and photographed. It spends tokens, so it is run by
hand, before and after any change to `guide.md`, a component's page, or the skill. See
`evals/README.md`.

## Writing style

- Plain text. No emoji or emoticons, in code, comments, docs, commit messages, or output, unless a
  specific case truly needs one.
- American English with the Oxford comma.

## Ownership

- `README.md` belongs to the owner. Agents do not edit it unless the owner gives explicit
  permission for that specific change.
