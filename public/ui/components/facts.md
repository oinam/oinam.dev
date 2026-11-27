# Facts

A list of names and their values, each pair on a line, ruled apart.

- Use: `.onm-facts`
- Files: `facts.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="onm-facts"` on a `<dl>`. It is for the details of one thing, such as a booking, a place, or a
person, where a table would be too much. Each name and its value go in a `<div>`, as a `<dt>` and a
`<dd>`.

```html
<dl class="onm-facts">
  <div>
    <dt>Berth</dt>
    <dd>E 11</dd>
  </div>
  <div>
    <dt>Arrived</dt>
    <dd>10 August</dd>
  </div>
  <div>
    <dt>Nights</dt>
    <dd>Four</dd>
  </div>
</dl>
```

Use a table instead when there are several things to compare, each with the same names.
