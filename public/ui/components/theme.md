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

Add `auto` to offer a way back to following the system. A press then goes from the theme on show
to the other one, then back to the first, chosen this time, and then to following the system
again, which forgets the choice. So the first press always changes the page, and the last may not;
the label says what each press does.

```html
<o-theme auto>
  <button class="button" data-variant="ghost" type="button">Switch theme</button>
</o-theme>
```

The theme on show is `data-theme` on `<html>`, `light` or `dark`, and the choice is
`data-theme-choice`: `light`, `dark`, or `auto`. Show the choice on the button from the second:
`[data-theme-choice="auto"] .icon-system { ... }`. The choice is stored under the `theme` key in
`localStorage`, and following the system stores nothing. A stored value other than `light` or
`dark`, such as `auto` written by a site's earlier toggle, is read as following the system.
