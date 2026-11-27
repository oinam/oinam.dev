# Tabs

Turns a run of sections into tabs.

- Use: `<onm-tabs>`
- Files: `tabs.css`, `tabs.js`. It needs its script; without it, the markup still reads correctly.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-tabs>` turns a run of `<section>` elements into tabs. Each section opens with a heading, which
becomes the name of its tab. `label` names the set for screen readers. Without the script, the
sections follow one another under their headings.

```html
<onm-tabs label="Install">
  <section>
    <h3>Link it</h3>
    <p>Point a stylesheet at oinam.dev.</p>
  </section>
  <section>
    <h3>Copy it</h3>
    <p>Take the files you need.</p>
  </section>
</onm-tabs>
```

It fires `change` when the tab changes; its `selected` property is the index, and `select(index)`
shows a tab.
