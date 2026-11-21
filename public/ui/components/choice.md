# Choice and switch

A checkbox, a radio button, or a switch, with its label.

- Use: `.choice, input[role="switch"]`
- Files: `form.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

A checkbox or a radio button sits inside a `<label class="choice">`. A switch is a checkbox with
`role="switch"`.

```html
<label class="choice"><input type="checkbox" /> Send me the changelog</label>
<label class="choice"><input type="radio" name="plan" /> Monthly</label>
<label class="choice"><input type="checkbox" role="switch" /> Deploy on push</label>
```
