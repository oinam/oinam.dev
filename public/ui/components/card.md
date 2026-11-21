# Card

Groups related things on a raised surface.

- Use: `<o-card>`
- Files: `card.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-card>` groups related things on a raised surface. A `<footer>` inside holds actions and stays
at the bottom, so cards in a row line up.

```html
<o-card>
  <h3>Standards</h3>
  <p>The rules every project inherits.</p>
  <footer><a class="button" data-variant="outline" href="/docs/">Read</a></footer>
</o-card>
```
