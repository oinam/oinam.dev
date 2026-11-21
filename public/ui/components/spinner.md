# Spinner

Says that something is under way.

- Use: `<o-spinner>`
- Files: `spinner.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-spinner>` says that something is under way. It takes the size of the text around it.

```html
<o-row>
  <o-spinner role="status" aria-label="Loading the tide table"></o-spinner>
  <span>Loading the tide table</span>
</o-row>
```

Give it `role="status"` and an `aria-label` that names what is happening. Inside a button, use `aria-busy="true"` on the button instead.
