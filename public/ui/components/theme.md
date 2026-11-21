# Theme

A light and dark toggle that remembers the choice.

- Use: `<o-theme>`
- Files: `theme.js`, `theme-init.js`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-theme>` goes around a `<button>` and makes it a light and dark toggle. It remembers the choice
and follows the system until one is made. It keeps the button's `aria-label` current. To hide the
button until the script is ready, add `o-theme:not(:defined) { visibility: hidden; }` to the page.

```html
<o-theme>
  <button class="button" data-variant="ghost" type="button">Switch theme</button>
</o-theme>
```
