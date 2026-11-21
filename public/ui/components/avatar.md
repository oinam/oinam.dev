# Avatar

A small round picture of someone, or their initials.

- Use: `<o-avatar>`
- Files: `avatar.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-avatar>` is a small round picture of someone, or their initials when there is no picture. `size` takes `small` or `large`.

```html
<o-avatar><img src="/people/asha.jpg" alt="Asha Rao" /></o-avatar>
<o-avatar size="large" role="img" aria-label="Asha Rao">AR</o-avatar>
```

With initials, give it `role="img"` and an `aria-label` with the full name.
