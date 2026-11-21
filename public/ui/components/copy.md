# Copy

Adds a copy button to a block of code.

- Use: `<o-copy>`
- Files: `copy.css`, `copy.js`, `button.css`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-copy>` goes around a `<pre>` and adds a button that copies its text.

```html
<o-copy>
  <pre><code>mise run check</code></pre>
</o-copy>
```
