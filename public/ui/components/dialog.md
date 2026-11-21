# Dialog

A modal or a drawer, on a <dialog>, opened and closed without script.

- Use: `.dialog`
- Files: `dialog.css`, `button.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="dialog"` on a `<dialog>`. Buttons open and close it by naming its `id`, with `commandfor`
and `command`; there is no script to write. `closedby="any"` lets a click outside close it.

```html
<button class="button" type="button" commandfor="confirm" command="show-modal">Delete</button>

<dialog class="dialog" id="confirm" aria-labelledby="confirm-title" closedby="any">
  <h2 id="confirm-title">Delete the file?</h2>
  <p>This cannot be undone.</p>
  <footer>
    <button class="button" data-variant="ghost" type="button" commandfor="confirm" command="close">
      Cancel
    </button>
    <button class="button" type="button">Delete</button>
  </footer>
</dialog>
```

`data-side` takes `right`, `left`, or `bottom`, and makes it a drawer: a panel that slides in from
that edge, for a form or a set of details beside the page.

```html
<dialog
  class="dialog"
  id="details"
  data-side="right"
  aria-labelledby="details-title"
  closedby="any"
>
  <h2 id="details-title">Berth 12</h2>
  <p>East quay, deep water.</p>
</dialog>
```

For a question that must be answered, give the dialog `role="alertdialog"` and leave off `closedby`,
so that only its buttons can close it.
