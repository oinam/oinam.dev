# Card

Groups related things on a raised surface.

- Use: `<onm-card>`
- Files: `card.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-card>` groups related things on a raised surface. A `<footer>` inside holds actions and stays
at the bottom, so cards in a row line up.

```html
<onm-card>
  <h3>Standards</h3>
  <p>The rules every project inherits.</p>
  <footer><a class="onm-button" data-variant="outline" href="/docs/">Read</a></footer>
</onm-card>
```
