# Alert

Sets a message apart: a note, a warning, or danger.

- Use: `<o-alert>`
- Files: `alert.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-alert>` sets a message apart. `variant` takes `warning` (a heavy frame) or `danger` (ink and
cloud swapped); without it, the alert is a note. Give it `role="note"`, or `role="alert"` when it appears in answer to something the reader
just did. Open with a `<strong>` title.

```html
<o-alert variant="warning" role="note">
  <strong>Warning</strong>
  <p>This rewrites history.</p>
</o-alert>
```
