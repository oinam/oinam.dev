# Badge

A small label: a status, a kind, a count, a "new".

- Use: `<o-badge>`
- Files: `badge.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-badge>` is a small label. `variant="solid"` fills it.

```html
<o-badge>Soon</o-badge> <o-badge variant="solid">New</o-badge>
```

## Tone

A status that must be read at a glance, beside others like it, may take a tone: `success`,
`warning`, `danger`, or `info`. It is the one place the system uses a hue. The word still says the
status; the color only helps the eye. A toned badge with no words is a finding of the linter.

```html
<o-badge tone="success">Verified</o-badge>
<o-badge tone="warning">Unverified</o-badge>
<o-badge tone="danger">Failed, refunded</o-badge>
<o-badge tone="info">Beta</o-badge>
```

`variant="solid"` turns a tone over: the status color becomes the fill.

```html
<o-badge tone="danger" variant="solid">Failed</o-badge>
```

Each tone is a pair of tokens, `--color-success` on `--color-success-fill`, and the same for the
others, each with a light and a dark value. The text is only ever set on its own fill, so it reads
the same whatever the page wears. Use a tone for a status, never for decoration or emphasis, and
not for a single status alone on a page, where a plain badge says it as well.

## Hue

Things of several kinds that sit together, such as the topics on each item of a listing, may take
a hue, `hue="1"` to `hue="6"`. A page gives each kind its own number and keeps to it. The hues are
numbered, not named, so a number carries no meaning of its own. The word says the kind; the color
only helps the eye. A hued badge with no words is a finding of the linter, as is a badge with both
a hue and a tone: a badge is a kind or a status, not both.

```html
<o-badge hue="1">Design</o-badge>
<o-badge hue="2">Engineering</o-badge>
<o-badge hue="3">Product</o-badge>
<o-badge hue="4">Leadership</o-badge>
<o-badge hue="5">AI</o-badge>
<o-badge hue="6">Remote</o-badge>
```

A kind badge has squarer corners than a status badge, so the two are told apart in one row. Each
hue is a pair of tokens, `--color-hue-1` on `--color-hue-1-fill`, at 7 to 1 or better in light and
dark.
