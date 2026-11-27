# Tooltip

A few words about a control, on hover or focus.

- Use: `<onm-tooltip>`
- Files: `tooltip.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-tooltip>` shows a few words about a control when the pointer is over it or the keyboard is on it. Inside go the control and a `<span role="tooltip">`, tied together with `aria-describedby`.

```html
<onm-tooltip>
  <button
    class="onm-button"
    data-variant="outline"
    type="button"
    aria-describedby="tooltip-release"
  >
    Release
  </button>
  <span role="tooltip" id="tooltip-release">Frees the berth for the next boat</span>
</onm-tooltip>
```

Keep it to a hint. Touch cannot reach a tooltip, so anything a person must read or press belongs on the page or in a popover.
