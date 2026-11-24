# Color variations

How to let someone pick a color, or a pair of colors, and get a site that looks entirely different
while everything else stays Base. Written on 2026-11-22 as a plan; "Built" below says what exists.

## Built

The colors live at https://oinam.dev/colors/, a list of pairs shown side by side in light and dark,
with a page for each.

- **The list is data.** `public/colors/colors.json` holds each color's number, name, title,
  description, and its three tokens in light and dark. It is the only file kept by hand.
- **The pages are written from it.** `mise run colors` (`scripts/colors.js`) works out every shade
  and every ratio and writes the list page, a page per color, a stylesheet per color to take away
  (`/colors/<id>.css`), and the scoped stylesheet the list page uses. `tests/colors.test.js` fails
  when a page and the list disagree, and holds every color to 4.5 to 1 in both themes. Writing the
  shades by hand was tried first, and they went stale within the hour.
- **The number is the address; the name is for reading.** `/colors/1/` and `/colors/1/navy/` are
  the same page, by a rewrite in `public/_redirects`, and any name after the number works. So a
  color can be renamed without breaking a link. The canonical address is the one with only the
  number. A take-away stylesheet is named by number too, and sits beside the folders, not in them,
  because the rewrite would catch a file inside one.
- **Colors are written in OKLCH, and hex is the alternate.** Lightness, chroma, and hue say what
  a color is: two colors with one hue are one color at two depths, and the numbers show it. So the
  list, the take-away stylesheets, and the pages use `oklch()`, with the hex of the same color
  beside it for tools that want one. The pages print the shades rounded for reading, since the
  browser works them out and they are written nowhere. Base itself stays in hex in `tokens.css`,
  because changing that file means a new version of the components; color 0 is checked to show
  the same on a screen. `scripts/color.js` has `toOklch()` to turn a hex into the list's form.
- **Most colors are adapted from others' proven scales.** Colors 6 to 36 are Radix Colors'
  scales (step 12 as ink, steps 2 and 1 as cloud and milk, and the same steps of the dark scale by
  night), and 37 to 41 are Tailwind CSS's (950 and 50, with white milk by day and a step above 950
  by night). Both are MIT, and `public/colors/LICENSES.txt` carries their notices. As published,
  most of their colored scales miss the gate: their darkest step is lighter than ours, and the
  faint ink mixed from it falls to about 3.5 to 1. So, by the rule under "Decided", the ink was
  deepened, hue and chroma kept, until every text shade passed; each color's `from.deepened` says
  on which side, and its page says so. The greys passed as they are. The data was read from
  `@radix-ui/colors@3.0.0` and `tailwindcss@4.1.11`.
- **Forty-two colors, 0 to 41.** Tailwind's Neutral was the one let go: it is a grey with no tint,
  the same as Carbon and Radix's Gray already on the list.
- **A press copies.** On the color pages, a chip or a value copies its color in OKLCH, and with
  Shift held its hex, as on Tailwind's colors page. `public/assets/colors.js` makes each marked
  chip and value a button, so a page without the script has no button that does nothing.
- **Numbers have no zeros in front.** `/colors/1/`, not `/colors/01/`: padding promises a
  fixed count, here 99, and reads like a code. Base is 0, and the variations count from 1.
- **Colors are not named after a product.** Different products may wear different colors, so a
  color says what it looks like, such as Navy, and a product says which one it wears.
- **Each color carries its accent.** Since 0.8.0 the accent button has a token of its own, and a
  site that wears a color should not keep Base's blue for it. So every take-away stylesheet sets
  `--color-accent` and `--color-accent-text` too. A color may set them in the list; one that does
  not takes them from its inks: the hue of the more colorful ink, chroma 0.15, as light as it can be by day under a white label, and as deep as it can be
  by night under the page's own cloud, while the label reaches 7 to 1 and the fill 3 to 1 against
  cloud and milk. A pair whose inks are grey takes its ink as the accent, as the solid button does, since a lighter grey reads as a button turned off. Base sets its own, the blue in `tokens.css`. `tests/colors.test.js` holds every
  color to it, hovered as well.
- **The list page cannot just set tokens on each strip.** A shade such as `--color-ink-soft` is
  worked out on `:root` from the page's own ink, and a descendant that sets another ink still
  inherits the page's shades. So `public/colors/colors.css` declares the mixes again on each strip.

## Oinam's own colors

Recommended on 2026-11-22, for the owner to take or leave. Oinam's sites wear Navy, color 1. The
mark keeps two colors of its own, and they stay out of every interface:

- **Oinam Blue, `#1d387c`.** The logo on a light ground. On a dark ground it falls to 1.6 to 1, so
  there the logo is drawn in the text color. It is too light to be ink: the faint ink mixed from it
  falls to 3.4 to 1.
- **Oinam Orange, `#ff6600`.** A mark only: a dot, a rule, a fill behind the logo. It reaches only
  2.7 to 1 as text on a light ground; navy on orange reads at 6 to 1.

The rest of the 27-color palette on oinam.com maps to Navy's roles or is let go: Midnight, Oxford
Blue, Magpie, and Marine become the navy; Dark and Light become ink and cloud; the nine greys become
the mixed shades; the two other accents and the pale blues (Icicle, Sky, Cornflower, Pool, Chagall)
are let go; and the Tertiary violet, `#7c3aed`, is let go as the color every generated page reaches
for.

## What is already there

Every color in the system comes from three tokens in `public/ui/tokens.css`:

- `--color-ink`, the text, nearly black in light and nearly white in dark;
- `--color-cloud`, the page;
- `--color-milk`, a raised surface, a step off cloud.

Each is written with `light-dark()`, so one token holds both themes. Every other shade, such as the
soft and faint inks, the lines, and the wash, is ink mixed into cloud with `color-mix()` in Oklab.
No component names a color of its own. So changing those three values recolors every component,
in both themes, and nothing else moves. That is the whole mechanism, and it already works: the
Paper and Carbon choices on Play, and the designs in the garden, are only these tokens.

`tests/garden.test.js` checks every design in the garden: ink, soft ink, and faint ink, on cloud
and on milk, in light and in dark, must all reach 4.5 to 1.

## The idea: a pair is a design

A person chooses two colors, a dark one and a light one. The dark becomes ink in the light theme and
cloud in the dark theme, and the light one does the reverse. Milk is worked out from cloud. So two
colors make a whole design, in both themes, and the person never has to think about the rest.

What makes it feel like a new site, not Base in a tint:

- **Hue in both colors.** A deep indigo ink on a pale indigo cloud reads as one designed thing. A
  colored ink on Base's grey cloud reads as a mistake.
- **A cloud that is not white.** Most of the screen is cloud, so the cloud's color is most of the
  look. Paper, sand, a pale green, or a dark ground with light ink.
- **Dark grounds as first choices.** A pair can be offered dark first: a design whose default is
  night, such as ink-colored ground and paper-colored text.

## How to start

1. **A pair picker on Play.** Add a fourth colors choice, "Your own", with two color inputs. From
   the two values, `variation.js` writes the three tokens with `light-dark()`. Milk is cloud moved
   a few percent toward white in light and toward ink in dark, in Oklab, the way the other mixes
   are made. The page shows the result live, as it does now.
2. **Contrast before beauty.** The picker shows the six ratios the garden test checks, beside the
   choice. Below 4.5 to 1, it says which pair fails and offers the nearest color that passes: same
   hue, lightness moved until it does. A variation that cannot pass cannot be taken away. The
   contrast code in `scripts/color.js` already does this sum; move it where the page can use it too.
3. **The dark theme from the light one.** Most people choose for one theme. Work out the other by
   keeping hue and chroma and flipping lightness in Oklch, then check it the same way. Let the person
   adjust it, but never ask them to start from nothing.
4. **Curated pairs.** A short list of named pairs that pass, offered before the free picker, since
   choosing is easier than making. Traditional color sets are a good source of names and of colors
   that belong together: the Japanese colors of nipponcolors.com, for one. Each pair is a design in
   the garden, so the test checks it.
5. **A link that holds the choice.** Put the two colors in the Play address, so a design can be
   shared and reopened before it is taken away.

## What stays the same

- Two colors. A variation chooses its own two; it does not add a third. Since 0.8.0 the system has
  an accent, for the one main action, and hues for kinds and tones for statuses, each decided in
  `public/ui/why.md` under "Two colors". A variation may set them, and the tests hold it to the
  same contrast as Base's: the accent at 3 to 1 against its cloud and milk.
- Tokens only. A pair that needs a component restyled is not a variation.
- Contrast is a gate, not a warning. See "Accessible" in `AGENTS.md`.

## Decided

The owner left these to best practice, on 2026-11-22.

- **Milk is worked out, and may be set by hand.** The picker works it out from cloud, so a person
  chooses two colors and no more. A stylesheet may still set it, as the garden's designs do, and
  the garden test checks it either way.
- **4.5 to 1 is the gate for every ink, the faint one too.** That is WCAG AA for ordinary text,
  and the faint ink is ordinary text, only quieter. It is not raised: a higher gate would turn away
  most pairs with any color in them. Base aims higher where it can, with its soft ink, the text of
  running prose, at 7 to 1 (AAA), but that is an aim, not a gate.
- **The 68% and 58% shares stay fixed.** They are part of Base, and a variation is token values,
  not new mixes. When a pair fails, the picker darkens the ink or lightens the cloud until it
  passes, the same hue kept. Navy, color 1, is the example: the brand's own Blue, `#1d387c`,
  passes as ink on its own at 10 to 1, but its faint ink falls to 3.4, so Navy's ink is `#06194e`.
  That is as light as an ink can be on that cloud and still pass, and it reads as blue by carrying
  more chroma, not more lightness. A saturated ink loses contrast faster when it is mixed into a
  pale cloud than a near-black one does, so the darker the ink, the more color it can carry.
