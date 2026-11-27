# Toast

Brief messages that appear in a corner and go away again.

- Use: `<onm-toast>`
- Files: `toast.css`, `toast.js`, `button.css`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-toast>` is where brief messages appear, in a corner, and go away again. A button with `data-toast` shows its message when pressed, with no script of your own.

```html
<button
  class="onm-button"
  data-variant="outline"
  type="button"
  data-toast="Berth 12 is yours until Friday"
>
  Book the berth
</button>
```

From script: `import { toast } from "/ui/toast.js"`, then `toast("Saved")`. A message stays for six seconds or until dismissed, and is announced to screen readers without taking the focus. A toast is for news that needs no answer; anything a person must act on belongs in the page or in a dialog.
