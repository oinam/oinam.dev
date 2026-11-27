# Row

A row that wraps. Children sit side by side, a gap apart.

- Use: `<onm-row>`
- Files: `layout.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-row>` is a row that wraps. `gap` takes a space step: `1`, `2`, `3`, `4`, `6`, `8`, `12`, or `16` (default `3`). `justify` takes `between`, `center`,
or `end`. `align` takes `start` or `baseline`; the default centers children vertically.

```html
<onm-row justify="between">
  <strong>Invoice 204</strong>
  <button class="onm-button" type="button">Pay</button>
</onm-row>
```
