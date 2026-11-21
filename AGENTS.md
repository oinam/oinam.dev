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
- **Documented.** Each project states how to install, lint, format, test, and run evals in one
  place, and keeps it current.

## Website

The site at https://oinam.dev is the `public/` folder, served as it is by Cloudflare Pages. Every
push to `main` deploys it.

- **For AI first.** Agents and AI tools are the readers; people mostly look. Content lives in the
  HTML itself, in semantic markup, and reads the same with scripts off. `public/llms.txt` maps the
  site for language models.
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

The site's own styles and its search are in `public/assets/`. Everything else it wears comes from
the components, which it uses the same way anyone else would.

## Components

`public/ui/` is Oinam UI: the components an agent is pointed at to start designing. Its guide for
agents is `public/ui/guide.md`, served at https://oinam.dev/ui/guide.md. Read that to use the
components; read this to change them.

- **Plain HTML, CSS, and JavaScript.** No React, no framework of any kind, no build step, and no
  dependencies. Every file runs exactly as it is written. People should be able to read it, learn
  from it, and build their own.
- **Web components are the structure.** Anything HTML has no element for is a custom element with
  an `o-` name, such as `<o-card>`. A native element that already does the job takes a class
  instead, such as `<button class="button">`; it is never wrapped or rebuilt.
- **Script is the exception.** Most elements are styled by CSS alone. One that needs behavior wraps
  ordinary HTML in the light DOM, with no shadow DOM, so the page reads correctly before the script
  runs and where it never does.
- **Tokens only.** Every color, size, and shape is a custom property from `tokens.css`. Two colors
  do all the work, and no component adds a hue.
- **Each file stands alone.** One component, one stylesheet, and one script if it needs one, each
  opening with a comment that shows the markup. `ui.css` and `ui.js` gather them.

A new component is added in each of these places, and the tests fail until it is:

- its files in `public/ui/`, gathered into `ui.css` and, for a script, `ui.js`
- `public/ui/registry.json`, the components as data
- `public/ui/guide.md`, under a heading of its own
- `public/ui/index.html`, as a specimen in an `<o-example>`, with a link in the contents
- `public/search.json`

Elements with behavior are tested in `tests/`, against the DOM that `tests/dom.js` sets up.

## Development

[mise](https://mise.jdx.dev) pins the tools and runs every task. `mise.toml` is the one place they
are defined; `package.json` only lists the linters and the formatter.

- `mise trust`, once per clone, then `mise install` to fetch Node and Wrangler.
- `mise run dev` serves the site the way Cloudflare does, headers and 404 page included, and opens
  it.
- `mise run format` formats everything with Prettier.
- `mise run lint` lints the scripts (ESLint), the styles (Stylelint), and the pages (html-validate).
- `mise run test` runs the test suite with Node's test runner.
- `mise run check` runs the format check, the linters, and the tests. CI runs the same task on
  every push and pull request.

There are no evals yet, because nothing here drives or wraps a model yet.

## Writing style

- Plain text. No emoji or emoticons, in code, comments, docs, commit messages, or output, unless a
  specific case truly needs one.
- American English with the Oxford comma.

## Ownership

- `README.md` belongs to the owner. Agents do not edit it unless the owner gives explicit
  permission for that specific change.
