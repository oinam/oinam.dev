# Breadcrumb

Where this page sits, from the top down.

- Use: `.breadcrumb`
- Files: `breadcrumb.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="breadcrumb"` on the `<nav>` around an ordered list of links: where this page sits, from the top down. The last item is the page itself, and is not a link.

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/ui/">Components</a></li>
    <li aria-current="page">Breadcrumb</li>
  </ol>
</nav>
```
