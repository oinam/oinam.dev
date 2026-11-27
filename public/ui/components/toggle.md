# Toggle

A button that stays pressed, alone or in a group.

- Use: `.onm-toggle, <onm-toggle-group>`
- Files: `toggle.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

A toggle is a button that stays pressed. It is a checkbox underneath, so it needs no script and sends its value with a form: `class="onm-toggle"` on the `<label>` around the `<input>`. `<onm-toggle-group>` sets several side by side in one frame; with radio buttons of one name inside, only one can be pressed at a time.

```html
<onm-row gap="6">
  <label class="onm-toggle"><input type="checkbox" checked /> Shore power</label>
  <onm-toggle-group role="group" aria-label="View">
    <label class="onm-toggle"><input type="radio" name="toggle-view" checked /> List</label>
    <label class="onm-toggle"><input type="radio" name="toggle-view" /> Map</label>
    <label class="onm-toggle"><input type="radio" name="toggle-view" /> Tides</label>
  </onm-toggle-group>
</onm-row>
```
