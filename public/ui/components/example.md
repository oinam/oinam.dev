# Example

Shows markup at work and prints its source beside it.

- Use: `<o-example>`
- Files: `example.css`, `example.js`, `tabs.css`, `tabs.js`, `copy.css`, `copy.js`, `button.css`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-example>` shows a piece of markup live and prints its source beside it, with a copy button. It
is for documentation pages.

```html
<o-example>
  <button class="button" type="button">Save</button>
</o-example>
```
