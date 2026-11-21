# Button

A button, on a <button> or an <a>.

- Use: `.button`
- Files: `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="button"` on a `<button>` or an `<a>`.

- `data-variant`: `outline` or `ghost`. Without it, the button is solid ink. Use one solid button
  per group, for the main action.
- `data-size`: `small`, `large`, or `icon` (a square, for a lone icon; give it an `aria-label`).
- `disabled`, or `aria-disabled="true"` on a link.
- `aria-busy="true"` while it works: it shows a spinner and takes no more presses.

```html
<button class="button" type="button">Save</button>
<button class="button" data-variant="outline" type="button">Preview</button>
<button class="button" data-variant="ghost" data-size="small" type="button">Cancel</button>
<a class="button" data-size="large" href="/docs/">Read the docs</a>
```
