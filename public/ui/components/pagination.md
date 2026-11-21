# Pagination

Links to the pages of a long list.

- Use: `.pagination`
- Files: `pagination.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="pagination"` on the `<nav>` around a list of page links. The page being shown has `aria-current="page"`.

```html
<nav class="pagination" aria-label="Pages">
  <ul>
    <li><a href="?page=1">Previous</a></li>
    <li><a href="?page=1">1</a></li>
    <li><a href="?page=2" aria-current="page">2</a></li>
    <li><a href="?page=3">3</a></li>
    <li><a href="?page=3">Next</a></li>
  </ul>
</nav>
```
