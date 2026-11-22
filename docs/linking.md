# Linking to oinam.dev

The components are meant to be taken: a project copies them with `install.sh` and owns its copy.
Some people will link the files from oinam.dev instead, to try the system on a page or for a demo
they will not maintain. This page records what that means for the site, what was decided, and how
a release is cut. The reasons, in short, are also in `public/ui/why.md`, under "Link a release,
never the newest".

## The question

Asked on 2026-11-22: if people link the assets on oinam.dev directly, will it just work? Should
they be pointed at GitHub, or at Cloudflare? Should CORS be opened to everyone? And what does it
cost in bandwidth if the system becomes a little popular?

## What was found

Checked on 2026-11-22, against the live site and Cloudflare's documentation.

- **It works.** Every file under `/ui/` is sent with `Access-Control-Allow-Origin: *` (the `/ui/*`
  rule in `public/_headers`). That header is what a browser needs before it will use a font, or a
  module script, from another site. Plain stylesheets and classic scripts would load without it.
  The site's own Content-Security-Policy governs its own pages, not the pages that link its files.
- **CORS is already open where it is needed**, and nowhere else. Opening it for the whole site
  would add nothing: no other site has a reason to fetch the site's own pages.
- **Not GitHub.** github.com, and raw.githubusercontent.com, serve files as plain text with
  `nosniff`, so browsers refuse them as stylesheets or scripts. Third-party mirrors of GitHub would
  work, but the owner did not want a shared host for the files, and oinam.dev is already one.
- **Bandwidth is not a concern.** The Cloudflare Pages limits page
  (https://developers.cloudflare.com/pages/platform/limits/) lists no bandwidth or request limit
  for static files on the Free plan. Its limits are on the site itself: 20,000 files, 25 MiB a
  file, and 100 rules in `_headers`. Only Pages Functions count against a request quota, and the
  site has none. The files are small text and a few fonts of tens of KB, cached at Cloudflare's
  edge.
- **The real risk was change, not cost.** A page linked to `/ui/ui.css` takes every new version as
  soon as it is deployed. When a version renames a class or a token, that page breaks, and nothing
  tells its owner. The files under `/ui/` are also cached for up to four hours, so for a short
  while after a deploy a browser may hold some old files and some new.

## What was decided

- A project still takes a copy. The guide says so first, and says that linking is not for an agent
  building a project.
- Linking is served, safely: each version from 0.5.0 on is kept, frozen, at
  `https://oinam.dev/ui/releases/<version>/`, and the guide and the components page show how to
  link one. `/ui/` itself stays the newest version, and still works from any site, with a warning.
- A release holds only what a page loads: the stylesheets, the scripts, and the fonts with their
  licenses. The guide, the tools, the data, and the patterns are read, not linked; git keeps every
  version of them. Leaving them out also keeps a stale guide from being found at a second address.
- A release is sent with `Cache-Control: public, max-age=31536000, immutable`. It does not repeat
  `Access-Control-Allow-Origin`, which it already has from the `/ui/*` rule: Pages joins a header
  that two matching rules both name, and `*, *` is not a valid origin.
- Nothing is backfilled. 0.4.1 and earlier were never released this way.

## Cutting a release

When a new version is named everywhere `AGENTS.md` lists, and the tests agree:

1. Change the release links in `public/ui/guide.md` and on the components page to the new version.
2. `mise run release`. It copies the files the registry names for a page into
   `public/ui/releases/<version>/`, and refuses a version that is already there.
3. `mise run check`, then commit the folder with the rest of the release.

Pushing to `main` deploys it, and from then on that folder is out in the world.

## Why a release is never edited

Pages that are not ours depend on a release staying exactly as it was. So:

- No change to a released folder, ever: not a fix, not a reformat. A fix is a new version.
- The formatter and the linters step over `public/ui/releases/` (`.prettierignore`,
  `.stylelintrc.json`, `eslint.config.js`), and so do the site's own tests in `tests/plain.test.js`.
  A rule added later must not rewrite, or fail, a file that was right when it shipped.
- `tests/releases.test.js` holds the current version's folder to the live files, byte for byte. So
  a stylesheet, a script, or a font cannot change after its version is released without a new
  version. Wording in the guide or a component's page may still change within a version, since
  neither is in a release.
- Git stores a file that did not change between versions only once, so a release that changes one
  stylesheet costs one stylesheet. Pages uploads files by their contents, too.

## Revisit

- If linking becomes the way most sites use the system, a linked page wants its own upgrade notes.
- If the file count ever nears the Free plan's 20,000, old releases could move to their own Pages
  project, kept at the same addresses by a redirect. That is a long way off: a release is about 50
  files.
