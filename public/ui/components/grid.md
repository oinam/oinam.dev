# Grid

Equal columns, as many as fit, with no breakpoints.

- Use: `<onm-grid>`
- Files: `layout.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-grid>` lays out equal columns, as many as fit, with no breakpoints. `gap` takes a space step: `1`, `2`, `3`, `4`, `6`, `8`, `12`, or `16` (default
`6`). `min` sets how narrow a column may get: `small` (11rem), the default (16rem), or `large`
(24rem).

```html
<onm-grid min="large" gap="8">
  <onm-card>One</onm-card>
  <onm-card>Two</onm-card>
</onm-grid>
```
