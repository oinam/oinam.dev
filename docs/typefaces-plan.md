# Typefaces: a plan

Written on 2026-11-27, at the owner's word, for the owner to take or leave. Nothing here is built
yet beyond the first step. Where it says "decided", the owner has said so; everything else is a
recommendation.

## Where this starts

- **Decided: the site wears Fraunces first.** Since 2026-11-27, oinam.dev sets its headings in
  Fraunces, the file oinam.com serves: Latin, upright, weight 400, every optical size, 35 KB. It
  lives in `public/assets/fonts/fraunces/` as the site's own font, not the system's, and is
  preloaded with `font-display: optional`, so a page never changes fonts while it is read. The
  garden and Play keep Base's fonts, because they show Base. Base itself is unchanged: it still
  uses the reader's own fonts and downloads none.
- **What the system has today.** Four open fonts in `public/ui/fonts/`, each with its license, a
  stylesheet that declares it and sets its token, and an entry under `fonts` in `registry.json`:
  Geist and Inter for text, Source Serif 4 for headings, and Geist Mono for code. Play offers
  them by name, from the `OPTIONS` list in `public/assets/variation.js`.

## Where it is heading

**Typefaces, as Colors are.** A page at `/typefaces/` that lists open typefaces side by side, each
with a page of its own, a file to take away, and the same gate for every one. A person, or the
agent building their page, picks one; anyone may still use a font of their own, as today. What
comes from here is always open, free, and distributable.

## How it would work, by the pattern Colors set

- **The list is data.** `public/typefaces/typefaces.json`, kept by hand: each typeface's number,
  name, family, role (headings, text, or code), license, source, the axes and weights it keeps,
  its fallback stack, and the file it serves. A script, `mise run typefaces`, writes every page
  and stylesheet from it, as `mise run colors` does, and a test fails when the list and the pages
  disagree.
- **The number is the address; the name is for reading.** `/typefaces/1/` and
  `/typefaces/1/fraunces/` are one page, by the same rewrite the colors use. Numbers count from 1,
  and Base, the reader's own fonts, is 1.
- **Each typeface's page** shows it set at every step of the type scale, in light and in dark, at
  its sizes in Base's headings, text, or code; its license and source; its file size; and how to
  take it.
- **Each typeface takes away as a folder**: its trimmed `woff2`, its license, and one stylesheet
  that declares it with `@font-face` and sets one token, `--font-heading`, `--font-body`, or
  `--font-mono`. Linked after the components, as a color is. Nothing is fetched from anyone else.
- **One home for fonts.** The four in `public/ui/fonts/` move into the list, so there is one
  place a font comes from. They stay in `/ui/fonts/` too, unchanged, until a version that says so
  in its changelog, since projects have taken them from there.
- **Play and the garden read the list.** Play's font choices come from `typefaces.json` instead
  of a list in a script, so a typeface added to the list is offered at once.

## The gate a typeface must pass

The tests hold every entry to these, as they hold every color to its contrast:

- **Open, and ours to serve.** The SIL Open Font License or one as free, with the license file
  beside the font. No font is linked from another site.
- **Trimmed, and the trim written down.** Only what its role uses: Latin to begin with, upright
  unless the role needs italic, and the weights Base sets that role in. The steps that made the
  file are recorded, as oinam.com's `docs/fonts.md` records Fraunces's, so anyone can make it
  again from the original.
- **Small.** A budget per file, say 60 KB, which every current font meets. A typeface over it is
  trimmed further or left out.
- **Readable at its role's sizes.** A text face is checked at the body size and the small sizes;
  a heading face across the heading steps. Where a program cannot judge this, a person looks at
  the pictures `tools/see.js` takes.
- **No flash.** Each stylesheet uses `font-display: optional` with a fallback stack chosen to
  match the face's width, so a late file never moves the page.

## In order

1. Done: Fraunces on the site's headings, as the site's own font.
2. Write `typefaces.json` with the five fonts there are, Fraunces among them, and the script and
   tests that make the pages from it. Base is 1.
3. Make Play and the garden read the list.
4. Add typefaces only through the gate, a few at a time, each with its trim written down.
5. Decide whether Fraunces, or any typeface, becomes Base's heading font. That would be a change
   to Base, and a new version of the components, so it waits until the list has been lived with.

## Decisions for the owner

- **Is the list for headings, text, and code alike, or headings first?** Headings show a typeface
  most, and cost the least to get wrong.
- **Pairs, or single faces?** Colors are pairs of ink and cloud. Typefaces could be offered
  singly, or as tested pairs of a heading face and a text face, which is what most people want.
- **The budget.** 60 KB a file is a starting point, not a measured one.
