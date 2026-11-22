# Adopting Oinam UI into an existing site

Read this only when the system is coming into a site that already has its own styles, build, and
pages. For a new page or a new project, `guide.md` is all there is to read.

The way in is gradual. The site keeps working at every step, and each part of it moves over on its
own, when it is ready.

## Why it can be gradual

Every file of the system loads into a cascade layer: `tokens`, `base`, `layout`, and `components`.
Styles outside any layer win over styles inside one, whatever their specificity. A site's existing
CSS is almost always outside a layer, so it keeps winning over the system's. Adding the system
changes nothing the site already styles; it only fills in what the site never styled.

So the order of work is: bring the system in under the site's styles, then retire one of the site's
own stylesheets, or partials, at a time where the system covers it. Make each one its own commit,
and look at the pages it touched, in light and in dark, before the next.

## Where the copy goes

Some site generators publish every Markdown file they find as a page, and a site's search may then
index it. The full copy holds the guide, a page for each component, the changelog, and the
patterns. Keep them out of the published site in one of two ways:

- **Install the full copy where the generator does not publish** (best). For Jekyll, a folder whose
  name starts with an underscore, such as `_ui/`. For Hugo, under `assets/`. For Eleventy, a folder
  named in `.eleventyignore`. Check by building the site and looking for `guide.md` in the output.
  The copy keeps the linter, the tools, and a guide that matches its version. Nothing in that folder
  is served, so the build must fold or bundle what pages need (below), and copy out the rest:
  `theme-init.js` and the fonts.
- **Install only what a page loads, into a folder that is served.**
  `curl -fsSL https://oinam.dev/ui/install.sh | sh -s -- --runtime assets/ui` takes the
  stylesheets, the scripts, and the fonts. Running it again keeps the copy that way; `--full`
  brings in the rest. There is no linter and no guide in it: read the guide at
  https://oinam.dev/ui/guide.md, which is the newest version, not necessarily the copy's, and run the
  linter from a full copy kept elsewhere, or not at all. The note for the project's `AGENTS.md`
  then reads: "This project is designed with Oinam UI, a runtime copy of which is in `assets/ui/`.
  Before designing or changing any page, read https://oinam.dev/ui/guide.md and follow it, and
  check the version in `assets/ui/registry.json` against its changelog. Do not edit the files in
  `assets/ui/`."

## Folding it into a build

`ui.css` gathers the system with about thirty `@import` lines, one request each. A site that builds
one stylesheet should fold the files into it instead, and keep their layers. Write the layer order
first, before anything else in the built file.

With Dart Sass, which loads plain `.css` files, with the copy in a folder Sass can find (beside the
entry file, or on its load path; a site generator's Sass converter may have a load path of its own):

```scss
@use "sass:meta";

@layer tokens, base, layout, components;
@layer tokens {
  @include meta.load-css("_ui/tokens");
}
@layer base {
  @include meta.load-css("_ui/base");
  @include meta.load-css("_ui/text");
}
@layer layout {
  @include meta.load-css("_ui/layout");
}
@layer components {
  @include meta.load-css("_ui/button");
  // ...one line for each component the site uses
}

// The site's own partials follow, outside any layer.
```

A bundler that inlines `@import` may take `ui.css` whole, if it keeps `layer()`: esbuild, with
`--bundle`, does. Either way, check the built file: it should open with
`@layer tokens, base, layout, components`, and `light-dark()` and `color-mix()` should be in it
as written.

A font's stylesheet names its `.woff2` beside it. Fold it in only if the built stylesheet is served
from a folder that has the font files too; otherwise link the font's stylesheet from the copy.

`ui.js` loads its parts by relative path, so renaming each file to a hashed name breaks it. Bundle
it into one file instead, such as `esbuild _ui/ui.js --bundle --minify --format=esm`, and hash that.
`theme-init.js` is a plain script, not a module; keep it apart from the bundle.

## Joining the tokens

The site's own custom properties and the system's tokens will meet. Look for the names both define;
the four `--font-*` tokens are the usual ones. Then choose a side for each value:

- **The system's tokens lead.** Point the site's properties at them, such as
  `--site-text: var(--color-ink);`, and delete the site's own values as their parts are retired.
- **The site's values stay.** Write them as a variation: one stylesheet, outside the copy, that sets
  the system's tokens to the site's values, linked after the system. `guide.md` says how, under
  "Base and variations". Keep it to tokens.

## Old content

A site with years of posts has markup it should not edit, written before the system and often
without classes. Wrap where it appears, in the layout or template, in `<o-prose>`. That styles it
without touching it. The system's base styles take margins off, so look at old posts for what
`<o-prose>` does not reach: raw HTML, embedded media, and tables.

## The linter on an existing site

Lint the built pages, with the linter from a full copy, so that the templates are what is
checked. Old content will report things the
site has chosen not to mend, such as a skipped heading level from years ago. Set those aside for the
region the content fills, with a reason, rather than not linting the page:

```html
<!-- lint-allow-start heading-order missing-alt: posts from before the system, kept as written -->
{{ content }}
<!-- lint-allow-end -->
```

`all` in place of the rules sets every rule aside there. A region left open is a finding of its own.

Two findings are common in a site's header, on every page:

- **A style attribute on an SVG.** A strict content policy blocks it there too. Use the SVG's own
  attributes, such as `fill`, `stroke`, and `opacity`, or a class.
- **The theme script written into the page.** The request it saves is real. Write in the code of
  `theme-init.js`, from `(function` to the end, unchanged: not its comment, which shows a closing
  `</script>` tag, and not through a minifier that rewrites it. The linter accepts that code. A site
  with a content policy must then allow it by its hash, worked out from the bytes the site serves.

## A toggle the site already has

`<o-theme>` keeps the visitor's choice under the `theme` key in `localStorage`, as `light` or
`dark`, and following the system stores nothing. Any other stored value, such as `auto`, is read as
following the system, so a site's earlier toggle hands over cleanly. For a toggle with three
states, light, dark, and the system's, use `<o-theme auto>`; `components/theme.md` has it.

## While the version starts with 0

Before 1.0.0, a change to the middle number can rename or remove things. The copy is the pin: the
site stays on its version until someone runs the installer again. So upgrade on purpose, one
version's "What to do" at a time, as `guide.md` says under "Upgrade", and look at the pages after
each.

## When the system has nothing for a part

Most of a mature site's styles will be for parts the system does not have. Keep those in the site's
own files, built the same way: tokens for every value, a native element where there is one, and a
prefix of the site's own for anything custom. When one looks like something other sites need too,
write it up as a design need for the owner to send; `CONTRIBUTING.md` at
https://github.com/oinam/oinam.dev says how.
