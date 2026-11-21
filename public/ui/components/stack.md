# Stack

A column. Children sit one under the other, a gap apart.

- Use: `<o-stack>`
- Files: `layout.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-stack>` is a column. `gap` takes a space step: `1`, `2`, `3`, `4` (default), `6`, `8`, `12`,
`16`. `align` takes `start` or `center`; without it, children stretch to full width.

```html
<o-stack gap="2">
  <h2>Title</h2>
  <p>Text under it.</p>
</o-stack>
```
