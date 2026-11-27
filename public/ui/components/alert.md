# Alert

Sets a message apart: a note, a warning, or danger.

- Use: `<onm-alert>`
- Files: `alert.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-alert>` sets a message apart. `variant` takes `warning` (a heavy frame) or `danger` (ink and
cloud swapped); without it, the alert is a note. Give it `role="note"`, or `role="alert"` when it appears in answer to something the reader
just did. Open with a `<strong>` title.

```html
<onm-alert variant="warning" role="note">
  <strong>Warning</strong>
  <p>This rewrites history.</p>
</onm-alert>
```

## Tone

An alert may take a tone, `success`, `warning`, `danger`, or `info`, when the color helps the eye
find what it says: a save that went through, a payment that failed. It is the same tone a badge
takes, the text on its own fill, at 7 to 1 or better in both themes. The weight still carries the
meaning, so a tone agrees with the variant: `variant="warning"` takes `tone="warning"`, and
`variant="danger"` takes `tone="danger"`, where the tone turns over as ink and cloud do. The linter
reports a tone that disagrees, as `tone-disagrees`.

```html
<onm-alert tone="success" role="status">
  <strong>Saved</strong>
  <p>Your changes are live.</p>
</onm-alert>
<onm-alert variant="danger" tone="danger" role="alert">
  <strong>Payment failed</strong>
  <p>The card was declined. Nothing was charged.</p>
</onm-alert>
```

Without a tone, an alert is as it always was: weight alone, in the page's two colors.
