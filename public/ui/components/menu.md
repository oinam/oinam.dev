# Menu

A button and the short list of actions it opens.

- Use: `<onm-menu>`
- Files: `menu.css`, `menu.js`, `popover.css`, `button.css`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-menu>` is a button and the short list of actions it opens. The list is a popover of plain `<button>` and `<a>` elements, with `<hr>` between groups. The arrow keys move between items, and choosing one closes the list. Without the script, Tab still reaches every item.

```html
<onm-menu>
  <button class="onm-button" data-variant="outline" type="button" popovertarget="menu-berth">
    Berth 12
  </button>
  <div class="onm-popover" id="menu-berth" popover>
    <button type="button">Rename</button>
    <a href="#menu">Open</a>
    <hr />
    <button type="button" disabled>Release</button>
  </div>
</onm-menu>
```

With the `context` attribute, the list opens where the pointer is on a right click anywhere inside the element, and needs no button: `<onm-menu context>` around the region, with the popover inside it.
