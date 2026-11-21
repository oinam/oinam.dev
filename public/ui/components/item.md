# Item

One row in a list: something to know it by, a title and a line, and an action.

- Use: `<o-item>`
- Files: `item.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-item>` is one row in a list of things: something to recognize it by, a `<div>` with a title and a line under it, and an action at the end. Rows that follow one another are ruled apart.

```html
<div>
  <o-item>
    <o-avatar role="img" aria-label="Asha Rao">AR</o-avatar>
    <div>
      <strong>Asha Rao</strong>
      <p>Harbor master</p>
    </div>
    <button class="button" data-variant="outline" data-size="small" type="button">Call</button>
  </o-item>
  <o-item>
    <o-avatar role="img" aria-label="Tomas Lind">TL</o-avatar>
    <div>
      <strong>Tomas Lind</strong>
      <p>Night watch</p>
    </div>
    <button class="button" data-variant="outline" data-size="small" type="button">Call</button>
  </o-item>
</div>
```
