# Button group

Joins buttons that belong together into one piece.

- Use: `<o-button-group>`
- Files: `button-group.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-button-group>` joins buttons that belong together into one piece. It suits outline buttons best.

```html
<o-button-group role="group" aria-label="Zoom">
  <button class="button" data-variant="outline" type="button">Out</button>
  <button class="button" data-variant="outline" type="button">Reset</button>
  <button class="button" data-variant="outline" type="button">In</button>
</o-button-group>
```

Give it `role="group"` and an `aria-label` that says what the buttons have in common.
