# Icons

Oinam's icons are [Phosphor](https://phosphoricons.com), version 2.1.1, under the MIT license:
1,512 icons, each drawn in the same hand, in every Oinam product and asset. They are served from
`/ui/icons/`, exactly as Phosphor draws them, with Phosphor's license beside them.

## Which weight, where

Phosphor draws each icon in six weights. Oinam keeps four, and each has its place:

| Weight  | Folder                    | Use it for                                                    |
| ------- | ------------------------- | ------------------------------------------------------------- |
| Regular | `icons/phosphor/regular/` | Every screen: a page, an app, a control. The default.         |
| Bold    | `icons/phosphor/bold/`    | Assets seen small or from far: a social card, a slide, a sign |
| Fill    | `icons/phosphor/fill/`    | A state that is on, such as a chosen tab; and assets          |
| Duotone | `icons/phosphor/duotone/` | Large art only, such as an empty state or a poster            |

Keep to one weight on a screen, with fill only for what is on. Regular is drawn with a line of 16
on a grid of 256, which is 1.5 at 24, the line the rest of the system is drawn with. Thin and
light are left out on purpose; they are too faint beside the system's type.

## Find one

`icons/icons.json` lists every icon with its categories and tags, so look one up by what it means:
search the tags for "delete" and find `trash`. Every weight has the same names; the file of every
weight but regular ends in its weight, as in `trash-bold.svg` and `trash-fill.svg`.

To see them all, browse [phosphoricons.com](https://phosphoricons.com). Any icon there is in the
folders here, under the same name.

## Use one

Copy the file's contents into the page, inline, and add three things: a size, a color, and what a
screen reader should do with it.

```html
<button class="onm-button" type="button">
  <svg width="1.25em" height="1.25em" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
    <path d="..." />
  </svg>
  Delete
</button>
```

- **Inline, never linked.** An `<img>` cannot take the text's color, and `<use>` cannot reach a
  file on another site. Inline, the icon is part of the page and costs no request.
- **The size in `em`**, so the icon grows with the text beside it: `1.25em` next to text, larger
  only for art.
- **`fill="currentColor"`**, as Phosphor ships it, so the icon is the color of its text, in light
  and in dark. Never give an icon a color of its own. The two colors hold for icons as for
  everything else (see "Two colors" in `why.md`).
- **Beside a word, hide it:** `aria-hidden="true"`. The word says it already.
- **Alone, name the control, not the icon:** `aria-label` on the button or link that holds it, and
  `aria-hidden="true"` on the icon. A button with only an icon still needs a name.
- **An icon that carries meaning by itself**, outside any control, takes `role="img"` and an
  `aria-label` of its own.
- **No icon that is only decoration.** The guide's rule stands: an icon must tell the reader
  something the layout does not already.

## The license

Phosphor is MIT. A project that copies icons from here keeps `icons/phosphor/LICENSE.txt` with
them, or with its other licenses. The installer does not take the icons, since a project uses a
handful of 1,512: copy the ones you use, and the license.

## When an icon is missing

1. Look again under another name in `icons.json`. Phosphor has 1,512, and most needs are met by
   one already there.
2. Ask Phosphor for it, on its GitHub, https://github.com/phosphor-icons. An icon they add costs
   Oinam nothing to keep.
3. Only then draw one, and put it in `icons/oinam/`, never among Phosphor's files. Draw it the way
   Phosphor does: on a grid of 256, with a line of 16 for regular and 24 for bold, round ends and
   joins, and a fill version that is the same shape made solid. Draw it in all four weights Oinam
   keeps, so it can stand anywhere one of Phosphor's can. Name it as Phosphor would, in lowercase
   words joined by hyphens.

Phosphor's files are never edited here. A new release of Phosphor is copied over the old with
`mise run icons`, and Oinam's own icons are untouched by it.
