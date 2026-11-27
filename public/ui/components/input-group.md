# Input group

Puts a unit, a prefix, or a button inside the frame of a field.

- Use: `<onm-input-group>`
- Files: `input-group.css`, `form.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-input-group>` puts something before or after a field, inside its frame: a `<span>` for a unit or a prefix, or a small button.

```html
<onm-stack>
  <onm-field>
    <label for="input-group-length">Length</label>
    <onm-input-group>
      <input class="onm-input" id="input-group-length" type="number" inputmode="decimal" />
      <span>meters</span>
    </onm-input-group>
  </onm-field>
  <onm-field>
    <label for="input-group-site">Website</label>
    <onm-input-group>
      <span>https://</span>
      <input class="onm-input" id="input-group-site" type="text" />
      <button class="onm-button" data-size="small" type="button">Check</button>
    </onm-input-group>
  </onm-field>
</onm-stack>
```

It goes where the `.onm-input` would go, inside an `<onm-field>`.
