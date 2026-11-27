# Badge

A small label: a status, a kind, a count, a "new".

- Use: `<onm-badge>`
- Files: `badge.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-badge>` is a small label. `variant="solid"` fills it.

```html
<onm-badge>Soon</onm-badge> <onm-badge variant="solid">New</onm-badge>
```

## Tone

A status that must be read at a glance, beside others like it, may take a tone: `success`,
`warning`, `danger`, or `info`. It is the one place the system uses a hue. The word still says the
status; the color only helps the eye. A toned badge with no words is a finding of the linter.

```html
<onm-badge tone="success">Verified</onm-badge>
<onm-badge tone="warning">Unverified</onm-badge>
<onm-badge tone="danger">Failed, refunded</onm-badge>
<onm-badge tone="info">Beta</onm-badge>
```

`variant="solid"` turns a tone over: the status color becomes the fill.

```html
<onm-badge tone="danger" variant="solid">Failed</onm-badge>
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
<onm-badge hue="1">Design</onm-badge>
<onm-badge hue="2">Engineering</onm-badge>
<onm-badge hue="3">Product</onm-badge>
<onm-badge hue="4">Leadership</onm-badge>
<onm-badge hue="5">AI</onm-badge>
<onm-badge hue="6">Remote</onm-badge>
```

A kind badge has squarer corners than a status badge, so the two are told apart in one row. Each
hue is a pair of tokens, `--color-hue-1` on `--color-hue-1-fill`, at 7 to 1 or better in light and
dark.
