# Scroll

A frame for something too long to show at once.

- Use: `<o-scroll>`
- Files: `scroll.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-scroll>` is a frame for something too long to show at once. It scrolls inside, with a thin bar, so the page keeps its length.

```html
<o-scroll tabindex="0" role="group" aria-label="Arrivals this week">
  <p>...</p>
</o-scroll>
```

Give it `tabindex="0"`, `role="group"`, and an `aria-label`, so the keyboard can reach it and scroll. It is 16rem tall at most; set `--scroll` on it in the page's styles for another height.
