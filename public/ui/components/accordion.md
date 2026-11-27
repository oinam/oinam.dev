# Accordion

A set of <details> that open and close.

- Use: `<onm-accordion>`
- Files: `accordion.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-accordion>` goes around a set of `<details>`. Give them all the same `name` to keep one open at
a time. Add `open` to the one that starts open.

```html
<onm-accordion>
  <details name="faq" open>
    <summary>Is it free?</summary>
    <p>Yes.</p>
  </details>
  <details name="faq">
    <summary>Do I need a framework?</summary>
    <p>No.</p>
  </details>
</onm-accordion>
```
