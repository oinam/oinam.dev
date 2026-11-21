# Slider

A value chosen by sliding, on an <input type="range">.

- Use: `.slider`
- Files: `slider.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="slider"` on an `<input type="range">`, which already works with the keyboard and with touch.

```html
<o-field>
  <label for="slider-draft">Draft, in meters</label>
  <input class="slider" id="slider-draft" type="range" min="0" max="5" step="0.1" value="1.8" />
</o-field>
```
