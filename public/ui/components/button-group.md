# Button group

Joins buttons that belong together into one piece.

- Use: `<onm-button-group>`
- Files: `button-group.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-button-group>` joins buttons that belong together into one piece. It suits outline buttons best.

```html
<onm-button-group role="group" aria-label="Zoom">
  <button class="onm-button" data-variant="outline" type="button">Out</button>
  <button class="onm-button" data-variant="outline" type="button">Reset</button>
  <button class="onm-button" data-variant="outline" type="button">In</button>
</onm-button-group>
```

Give it `role="group"` and an `aria-label` that says what the buttons have in common.
