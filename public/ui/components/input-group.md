# Input group

Puts a unit, a prefix, or a button inside the frame of a field.

- Use: `<o-input-group>`
- Files: `input-group.css`, `form.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-input-group>` puts something before or after a field, inside its frame: a `<span>` for a unit or a prefix, or a small button.

```html
<o-stack>
  <o-field>
    <label for="input-group-length">Length</label>
    <o-input-group>
      <input class="input" id="input-group-length" type="number" inputmode="decimal" />
      <span>meters</span>
    </o-input-group>
  </o-field>
  <o-field>
    <label for="input-group-site">Website</label>
    <o-input-group>
      <span>https://</span>
      <input class="input" id="input-group-site" type="text" />
      <button class="button" data-size="small" type="button">Check</button>
    </o-input-group>
  </o-field>
</o-stack>
```

It goes where the `.input` would go, inside an `<o-field>`.
