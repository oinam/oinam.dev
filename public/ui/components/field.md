# Field

A label, its control, and a line of help, kept together.

- Use: `<onm-field>, .onm-input`
- Files: `form.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-field>` keeps a label, its control, and a line of help together. The control takes
`class="onm-input"`, whether it is an `<input>`, a `<select>`, or a `<textarea>`. Always pair the
`<label for>` with the control's `id`.

```html
<onm-field>
  <label for="email">Email</label>
  <input class="onm-input" id="email" type="email" aria-describedby="email-help" />
  <small id="email-help">Used for sign-in only.</small>
</onm-field>

<onm-field>
  <label for="role">Role</label>
  <select class="onm-input" id="role">
    <option>Reader</option>
    <option>Editor</option>
  </select>
</onm-field>
```

Put several fields in an `<onm-stack>`. An invalid field shows a dashed border once the visitor has
touched it; use the browser's own validation attributes (`required`, `type`, `pattern`). For an
error found on the server, set `aria-invalid="true"` on the control and say what is wrong in the
`<small>`.
