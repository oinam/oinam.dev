# Popover

A small panel that opens under the button that names it.

- Use: `.onm-popover`
- Files: `popover.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="onm-popover"` on any element with the `popover` attribute. The browser opens it from the button that names it with `popovertarget`, closes it on Escape or a click elsewhere, and keeps it above everything. There is no script to write.

```html
<button class="onm-button" data-variant="outline" type="button" popovertarget="popover-hours">
  Office hours
</button>

<div class="onm-popover" id="popover-hours" popover>
  <strong>Office hours</strong>
  <p>Eight to five, every day but Sunday.</p>
</div>
```

It opens under its button, and moves above or to the other side when there is no room. In a browser that cannot place it by its button, it opens in the middle of the page. Use it in place of a card that appears on hover, which touch cannot reach.
