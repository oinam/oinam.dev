# Button

A button, on a <button> or an <a>.

- Use: `.button`
- Files: `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="button"` on a `<button>` or an `<a>`.

- `data-variant`: `accent`, `outline`, or `ghost`. Without it, the button is solid ink. Use one
  solid button per group, for the main action. `accent` is the solid button in color, for when the
  main action must stand apart from the rest; it takes the solid button's place, so a group has a
  solid button or an accent, not both. Its fill is `--color-accent`, at 3 to 1 or better against
  the page, and its label `--color-accent-text`, at 4.5 to 1 or better on it.
- `data-size`: `small`, `large`, or `icon` (a square, for a lone icon; give it an `aria-label`).
- `disabled`, or `aria-disabled="true"` on a link.
- `aria-busy="true"` while it works: it shows a spinner and takes no more presses.

```html
<button class="button" type="button">Save</button>
<button class="button" data-variant="outline" type="button">Preview</button>
<button class="button" data-variant="ghost" data-size="small" type="button">Cancel</button>
<a class="button" data-size="large" href="/docs/">Read the docs</a>
```

When the main action must stand apart, make it the accent, and keep the rest quieter:

```html
<a class="button" data-variant="accent" href="/apply/">Open posting and apply</a>
<button class="button" data-variant="outline" type="button">Save</button>
<button class="button" data-variant="ghost" type="button">Hide</button>
```
