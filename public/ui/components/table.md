# Table

Frames a plain table and lets a wide one scroll sideways.

- Use: `<o-table>`
- Files: `table.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<o-table>` goes around a plain `<table>`. It draws the frame and lets a wide table scroll
sideways.

```html
<o-table>
  <table>
    <thead>
      <tr>
        <th scope="col">Token</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">--space-4</th>
        <td>1rem</td>
      </tr>
    </tbody>
  </table>
</o-table>
```
