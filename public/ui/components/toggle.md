# Toggle

A button that stays pressed, alone or in a group.

- Use: `.toggle, <o-toggle-group>`
- Files: `toggle.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

A toggle is a button that stays pressed. It is a checkbox underneath, so it needs no script and sends its value with a form: `class="toggle"` on the `<label>` around the `<input>`. `<o-toggle-group>` sets several side by side in one frame; with radio buttons of one name inside, only one can be pressed at a time.

```html
<o-row gap="6">
  <label class="toggle"><input type="checkbox" checked /> Shore power</label>
  <o-toggle-group role="group" aria-label="View">
    <label class="toggle"><input type="radio" name="toggle-view" checked /> List</label>
    <label class="toggle"><input type="radio" name="toggle-view" /> Map</label>
    <label class="toggle"><input type="radio" name="toggle-view" /> Tides</label>
  </o-toggle-group>
</o-row>
```
