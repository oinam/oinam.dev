# Field

A label, its control, and a line of help, kept together.

- Use: `<o-field>, .input`
- Files: `form.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-field>` keeps a label, its control, and a line of help together. The control takes
`class="input"`, whether it is an `<input>`, a `<select>`, or a `<textarea>`. Always pair the
`<label for>` with the control's `id`.

```html
<o-field>
  <label for="email">Email</label>
  <input class="input" id="email" type="email" aria-describedby="email-help" />
  <small id="email-help">Used for sign-in only.</small>
</o-field>

<o-field>
  <label for="role">Role</label>
  <select class="input" id="role">
    <option>Reader</option>
    <option>Editor</option>
  </select>
</o-field>
```

Put several fields in an `<o-stack>`. An invalid field shows a dashed border once the visitor has
touched it; use the browser's own validation attributes (`required`, `type`, `pattern`). For an
error found on the server, set `aria-invalid="true"` on the control and say what is wrong in the
`<small>`.
