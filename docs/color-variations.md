# Color variations

How to let someone pick a color, or a pair of colors, and get a site that looks entirely different
while everything else stays Base. Written on 2026-11-22 as a plan, not a record of what is built.

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
   contrast code in `tests/color.js` already does this sum; move it where the page can use it too.
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

- Two colors. A variation chooses its own two; it does not add a third. An accent color, if one is
  ever wanted, is a decision for `public/ui/why.md` first, under "Two colors", and comes with a
  second cue beside it.
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
  passes, the same hue kept. The Oinam design in the garden is the example: the brand's own Blue,
  `#1d387c`, passes as ink on its own at 10 to 1, but its faint ink falls to 3.4, so the design
  uses a deeper navy, `#0b1736`. A saturated ink loses contrast faster when it is mixed into a pale
  cloud than a near-black one does, so the darker the ink, the more color the cloud can carry.
